import IORedis from 'ioredis'

const REDIS_PORT = process.env.REDIS_PORT || 6379

const createRedisClient = () => {
  if (!process.env.REDIS_HOST) {
    throw new Error('Missing REDIS_HOST')
  }
  return new IORedis({
    maxRetriesPerRequest: null,
    host: process.env.REDIS_HOST,
    port: REDIS_PORT,
  })
}

export { createRedisClient }
