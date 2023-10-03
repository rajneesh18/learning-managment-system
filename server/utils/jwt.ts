import { Response } from "express";
import { IUser } from "../models/user.model";
import { Redis } from "ioredis";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | undefined;
    secure?: boolean;
}

export const sendToken = ( user: IUser, statusbar: number, res:Response ) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    // upload session to redis


    
}