import IORedis from 'ioredis'

const REDIS_PORT = process.env.REDIS_PORT || 6379

const createRedisClient = () => {
  if (!process.env.REDIS_HOST) {
    throw new Error('Missing REDIS_HOST')
  }

  const redis = new IORedis({
    maxRetriesPerRequest: null,
    host: process.env.REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy(times) {
      if (times > 10) {
        console.log('Unable to connect to redis')
        return null
      }
      return 500
    },
  })
  redis.on('connect', () => {
    console.log('Redis connected')
  })
  redis.on('error', (error) => {
    console.log('Redis error', error.message)
  })
  return redis
}

export { createRedisClient }
