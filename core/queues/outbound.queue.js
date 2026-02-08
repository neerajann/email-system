import { Queue } from 'bullmq'

if (!process.env.REDIS_HOST) {
  throw new Error('Missing REDIS_HOST')
}
const REDIS_PORT = process.env.REDIS_PORT || 6379

const outboundEmailQueue = new Queue('outboundEmailQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: () => null,
    enableOfflineQueue: false,
  },
})

try {
  await outboundEmailQueue.waitUntilReady()
  console.log('Redis connected')
} catch (err) {
  throw new Error('Couldnot connect to redis server')
}

export default outboundEmailQueue
