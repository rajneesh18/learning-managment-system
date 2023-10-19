// import Redis from "ioredis";
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: 'https://neat-tadpole-31750.upstash.io',
  token: 'AXwGASQgODkwNWJkYmYtZTE1ZS00ZDE1LThmNjQtNDM1NDlhY2Y3ZGI0ZDFhYzZjZDIxYTJlNDhiYTk3YjA3Y2E2NjdiNjUxN2M=',
})

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis Connected`);
        return process.env.REDIS_URL;
    }

    throw new Error('Redis conection failed');
}

// export const redis = new Redis("rediss://default:d1ac6cd21a2e48ba97b07ca667b6517c@neat-tadpole-31750.upstash.io:31750");

