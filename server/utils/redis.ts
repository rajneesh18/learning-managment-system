// import Redis from "ioredis";
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: 'https://top-maggot-33652.upstash.io',
  token: 'AYN0ASQgYmZlMjE4OTEtOWMwOC00NTNjLTk4ODktOWQzODAwYTc5NGQ5Njg3NzY1YzRmN2U0NDUwYzg5ODMzYmZkYjFlMmU0ZTA='
})

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis Connected`);
        return process.env.REDIS_URL;
    }

    throw new Error('Redis conection failed');
}

// export const redis = new Redis("rediss://default:d1ac6cd21a2e48ba97b07ca667b6517c@neat-tadpole-31750.upstash.io:31750");

