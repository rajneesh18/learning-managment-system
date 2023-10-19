import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";
import { redis } from "../utils/redis";


// authenticated user
export const isAuthenticated = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const access_token = req.cookies.access_token as string;
    if(!access_token) {
        return next(new ErrorHandler("Please login to access this resource", 400));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;
    if(!decoded) {
        return next(new ErrorHandler("Access token is not valid", 400));
    }
    console.log(decoded);

    const user = await User.findById(decoded?.id);
    // const user = await redis.get(decoded.id);
    if(!user) {
        return next(new ErrorHandler("User not found", 400));
    }

    // req.user = JSON.parse(user);
    res.locals.user = user;


    next();

});