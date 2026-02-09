import { Queue } from 'bullmq'
import { createRedisClient } from '../redis/index.js'

const createInboundEmailQueue = async (connection) => {
  const inboundEmailQueue = new Queue('inboundEmailQueue', {
    connection: connection ?? createRedisClient(),
  })

  try {
    await inboundEmailQueue.waitUntilReady()
    return connection
  } catch (err) {
    throw new Error("Couldn't connect to redis server")
  }
}
export default createInboundEmailQueue
