import IORedis from 'ioredis'

const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})
export default connection
