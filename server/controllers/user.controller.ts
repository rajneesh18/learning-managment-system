import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { getUserById } from "../services/user.service";

/** Register User */
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registrationUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await User.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists", 400));
        }

        const user: IRegistrationBody = {
            name,
            email,
            password
        }
        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode }
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data
            });

            res.status(201).json({
                success: true,
                message: `Please check you email: ${user.email} to activate your account`,
                activationToken: activationToken.token
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

interface IActivationToken {
    token: string;
    activationCode: string;
};

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "5m" });


    return { token, activationCode };
}

/** Activate User */
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;

        const newUser: { user: IUser; activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: IUser; activationCode: string };


        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }

        const { name, email, password } = newUser.user;

        const existUser = await User.findOne({ email });

        if (existUser) {
            return next(new ErrorHandler("Email already exist", 400));
        }

        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            success: true
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

/** Login User */
interface ILoginUser {
    email: string;
    password: string;
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginUser;
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email & password", 400))
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        sendToken(user, 200, res);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

/** Logout User */
export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });

        let id = res.locals.user?._id || '';
        console.log(id);

        await User.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

/** Valiate User Role */
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(res.locals?.role || '')) {
            return next(new ErrorHandler(`Role: ${res.locals.user?.role} is not allowed to access this resource`, 403));
        }
    }
}


/** Update Access Token */
export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

        const message = 'Cound not refresh token';
        if (!decoded) {
            return next(new ErrorHandler(message, 400));
        }

        const session = await User.findById(decoded.id as string);
        if (!session) {
            return next(new ErrorHandler(message, 400));
        }
        const user = session;
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m"
        });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "3d"
        });

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        res.status(200).json({
            status: "success",
            accessToken
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

/** Get User Info */
export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = res.locals.user?._id;
        getUserById(userId, res);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

interface ISocialAuthBody {
    email: string;
    name: string;
    avatar: string;
}
/** Social Auth */
export const socialAuth = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    try {
        const { email, name, avatar } = req.body as ISocialAuthBody;
        const user = await User.findOne({ email });
        if (!user) {
            const newUser = await User.create({ email, name, avatar });
            sendToken(newUser, 200, res);
        } else {
            sendToken(user, 200, res);
        }
    } catch (error: any) {
        console.log(error);
        return next(new ErrorHandler(error.message, 400));
    }
});

interface IUpdateUserInfo {
    name?: string;
    email?: string;
}
export const updateUserInfo = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    try {
        const { name, email } = req.body as IUpdateUserInfo;
        const userId = res.locals.user?._id || '';
        const user = await User.findById(userId);

        if(email && user) {
            const isEmailExist = await User.findOne({ email });
            if(isEmailExist) {
                return next(new ErrorHandler("Email already exists", 400));
            }
            user.email =  email;
        }
        if(name && user) { user.name = name; }

        await user?.save();

        // await redis.set(userId, JSON.stringify(user));

        res.status(201).json({
            status: true,
            user
        });


    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
