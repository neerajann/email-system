import IORedis from 'ioredis'

const createRedisClient = () => {
  return new IORedis({
    maxRetriesPerRequest: null,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  })
}

export { createRedisClient }
