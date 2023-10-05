import { Request } from "express";
import { IUser } from "../models/user.model";


declare module 'express' {
    interface Request {
      user?: any;
    }
}