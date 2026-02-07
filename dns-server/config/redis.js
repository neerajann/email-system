import Redis from 'ioredis'
import env from 'dotenv'
env.config({ quiet: true })

let redis

const connectRedis = async () => {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    connectTimeout: 5000,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      return Math.min(times * 1000, 10000)
    },
  })

  redis.on('error', (err) => {
    console.error('[Redis error]', err.message)
  })

  redis.on('connect', () => {
    console.log('[Redis] connected')
  })

  redis.on('close', () => {
    console.warn('[Redis] connection closed')
  })

  redis.on('reconnecting', () => {
    console.warn('[Redis] reconnecting...')
  })
  return redis
}

const getRedis = () => {
  if (!redis) {
    throw new Error('Redis not initialized. Call connectRedis first.')
  }
  return redis
}

export { connectRedis, getRedis }
