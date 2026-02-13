import './config/env.js'
import connectDB from '@email-system/core/config'
import { createRedisClient } from '@email-system/core/redis'
import { Worker } from 'bullmq'
import processIncomingReply from './handlers/processIncomingReply.js'
import processNewIncomingMail from './handlers/processNewIncomingMail.js'

const redis = createRedisClient()
await connectDB()

const inboundEmailWorker = new Worker(
  'inboundEmailQueue',
  // Job is added to queue by SMTP server
  async (job) => {
    const { envelope, mail } = job.data
    if (!mail) return
    // If mail contains inReplyTo or references then its a reply mail so call
    if (mail.inReplyTo || mail.references?.length) {
      await processIncomingReply({ mail, envelope, redis })
    } else {
      // If not its a new mail
      await processNewIncomingMail({ mail, envelope, redis })
    }
  },
  {
    connection: redis,
    concurrency: 5, // Number of concurrent jobs this worker can process
    attempts: 1,
  },
)

console.log('Inbound worker is ready')

inboundEmailWorker.on('completed', (job) => {
  console.log('Completed', job.id)
})

inboundEmailWorker.on('error', (error) => {
  console.log('Error', error)
})

inboundEmailWorker.on('failed', (job, error) => {
  console.log(error)
  console.log('Failed', job.id, ' ' + error.cause)
})
