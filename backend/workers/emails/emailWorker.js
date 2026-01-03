import './envConfig.js'
import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import mongoose from 'mongoose'
import emailQueue from '../../src/queues/emailQueue.js'
import { domainEmailPattern } from '../../src/utils/pattern.js'
import sendFailureMessage from './services/sendFailureMessage.js'
import fetchAttachmentsRecord from './services/fetchAttachments.js'
import handleExternalMails from './services/handleExternalMails.js'
import handleLocalMails from './services/handleLocalMails.js'

await mongoose.connect(process.env.MONGO_DB_URL)

const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const {
      threadId,
      emailId,
      messageId,
      senderId,
      sender,
      recipients,
      subject,
      body,
      attachments,
      attachmentsRecords: cachedAttachments,
      retryCount = 1,
    } = job.data

    const attachmentsRecords =
      cachedAttachments ??
      (attachments?.length ? await fetchAttachmentsRecord(attachments) : [])

    const localRecipients = recipients.filter((r) => domainEmailPattern.test(r))
    const externalRecipients = recipients.filter(
      (r) => !domainEmailPattern.test(r)
    )

    const [localResult, externalResult] = await Promise.all([
      localRecipients.length
        ? handleLocalMails({ threadId, emailId, recipients: localRecipients })
        : [],
      externalRecipients.length
        ? handleExternalMails({
            messageId,
            sender,
            recipients: externalRecipients,
            subject,
            body,
            attachmentsRecords,
          })
        : { accepted: [], rejected: [], pending: [] },
    ])

    const localBounced = localResult
    const { rejected, pending, error } = externalResult

    const bouncedMails = [...localBounced, ...rejected]

    if (bouncedMails.length) {
      console.log('Sending Bounce Message: ' + JSON.stringify(job.data))
      await sendFailureMessage({
        senderId,
        sender,
        emailId,
        threadId,
        recipients: bouncedMails,
        type: 'BOUNCE',
        error,
      })
    }

    if (pending.length && retryCount < 3) {
      console.log('Retrying: ' + JSON.stringify(job.data))
      console.log('Retry count:', retryCount)
      await emailQueue.add(
        'emailQueue',
        {
          ...job.data,
          recipients: pending,
          retryCount: retryCount + 1,
          attachmentsRecords,
        },
        { delay: 1 * 20 * 1000 }
      )
    }

    if (pending.length && retryCount >= 3) {
      console.log('Sending Failure Message: ' + JSON.stringify(job.data))
      await sendFailureMessage({
        senderId,
        sender,
        emailId,
        threadId,
        recipients: pending,
        type: 'DELIVERY',
      })
    }
  },
  {
    connection,
    concurrency: 5,
    attempts: 1,
  }
)

emailWorker.on('completed', (job) => {
  console.log('Job Completed', job.id)
})

emailWorker.on('error', (job, err) => {
  console.log('Error:', err)
})

emailWorker.on('failed', async (job, err) => {
  console.log('Failed:', err)
})
