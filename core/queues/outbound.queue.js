import { Queue } from 'bullmq'
import { createRedisClient } from '../redis/index.js'

const createOutboundEmailQueue = async (connection) => {
  const outboundEmailQueue = new Queue('outboundEmailQueue', {
    connection: connection ?? createRedisClient(),
  })

  try {
    await outboundEmailQueue.waitUntilReady()
    return outboundEmailQueue
  } catch (err) {
    throw new Error("Couldn't connect to redis server")
  }
}

export default createOutboundEmailQueue
