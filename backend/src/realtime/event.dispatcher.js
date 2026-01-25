import { Worker } from 'bullmq'
import sseManager from './sse.manager.js'
import IORedis from 'ioredis'
import '../config/env.js'

const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

const eventWorker = new Worker(
  'eventQueue',
  async (job) => {
    const { mailData, userId } = job.data
    if (!userId || !mailData) return
    const userClients = sseManager.clients.get(userId)
    if (!userClients) return
    for (const reply of userClients) {
      console.log(mailData)
      reply.raw.write(`data:${mailData}`)
    }
  },
  {
    connection: connection,
    concurrency: 5,
    attempts: 1,
  },
)
