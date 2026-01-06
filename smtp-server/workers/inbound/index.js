import '../../config/env.js'
import connectDB from '@email-system/core/config'
import connection from '../connection.js'
import { Worker } from 'bullmq'
import processIncomingReply from './handlers/processIncomingReply.js'
import processNewIncomingMail from './handlers/processNewIncomingMail.js'

await connectDB()

const inboundEmailWorker = new Worker(
  'inboundEmailQueue',
  async (job) => {
    const { mail, session } = job.data
    if (!mail) return

    if (mail.inReplyTo || mail.references?.length) {
      await processIncomingReply({ mail, envelope: session.envelope })
    } else {
      await processNewIncomingMail({ mail, envelope: session.envelope })
    }
  },
  {
    connection,
    concurrency: 5,
    attempts: 1,
  }
)

inboundEmailWorker.on('completed', (job) => {
  console.log('Completed', job.id)
})

inboundEmailWorker.on('error', (error) => {
  console.log('Error', error)
})

inboundEmailWorker.on('failed', (job, error) =>
  console.log('Failed', job.id, ' ' + error.cause)
)
