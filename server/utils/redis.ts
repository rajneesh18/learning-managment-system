import Redis from "ioredis";

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis Connected`);
        return process.env.REDIS_URL;
    }

    throw new Error('Redis conection failed');
}

export const redis = new Redis();