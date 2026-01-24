import { Worker } from 'bullmq'
import sseManager from './sse.manager.js'

const eventWorker = new Worker('eventQueue', async (job) => {
  const { mailData, userId } = job.data
  if (!userId || !mailData) return
  const userClients = sseManager.clients.get(userId)
  if (!userClients) return
  for (const reply of userClients) {
    reply.raw.write(`data:${mailData}`)
  }
})
