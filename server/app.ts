require('dotenv').config();

import express, { NextFunction, Request, Response } from 'express';
export const app = express();

import cookieParser from "cookie-parser";
import cors from "cors";
import { ErrorMiddleware } from './middleware/error';
import userRouter from './routes/user.route';


app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(cors({ origin: process.env.ORIGIN }));

app.use("/api/v1", userRouter)


// testing api
app.get('/test', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: true,
        message: "API is working"
    });
});

// Unknown Route
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;

    next(err);
});

app.use(ErrorMiddleware);