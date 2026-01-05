import { Queue } from 'bullmq'

const outboundEmailQueue = new Queue('outboundEmailQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
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
