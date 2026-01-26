import { Queue } from 'bullmq'

const inboundEmailQueue = new Queue('inboundEmailQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    retryStrategy: () => null,
    enableOfflineQueue: false,
  },
})

try {
  await inboundEmailQueue.waitUntilReady()
  console.log('Redis connected')
} catch (err) {
  throw new Error('Couldnot connect to redis server')
}

export default inboundEmailQueue
