import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";

require('dotenv').config();


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

    const user = await User.findById(decoded?.id);
    if(!user) {
        return next(new ErrorHandler("User not found", 400));
    }

    res.locals.user = user;

    next();

});