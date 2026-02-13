import './config/env.js'
import { Worker } from 'bullmq'
import failureRecorder from './storage/failureRecorder.js'
import loadAttachmentMetadata from './assembly/loadAttachmentMetadata.js'
import localDeliveryAgent from './transport/localDeliveryAgent.js'
import smtpRelay from './transport/smtpRelay.js'
import { createRedisClient } from '@email-system/core/redis'
import { domainEmailPattern } from '@email-system/core/utils'
import connectDB from '@email-system/core/config'
import { createOutboundEmailQueue } from '@email-system/core/queues'

const redis = createRedisClient()
// Create outbound email queue (This will be used for retires)
const outboundEmailQueue = await createOutboundEmailQueue(redis)
await connectDB()

// Create a new worker for outbound email queue
const outboundEmailWorker = new Worker(
  'outboundEmailQueue',
  async (job) => {
    // Job from backend as well as when retried
    const {
      threadId,
      emailId,
      sender,
      recipients,
      headerTo,
      subject,
      body,
      attachments,
      messageId,
      inReplyTo,
      references,
      attachmentsRecords: cachedAttachments, // Rename it to cached attachment
      retryCount = 1,
      failureRecords = [],
    } = job.data

    let retriable = [] // Recipients that failed but can be retried for delivering
    let externalBounced = [] // External bounce recipients (the rejected recipients)
    let localBounced = [] // Local domain bounce recipients
    let externalResult = { bounced: [], retriable: [] }
    let attachmentsRecords = cachedAttachments // Cached attachments (Attachment record fetched from earlier retries)

    // Reattempt the failed external delivery (Retry job)
    if (failureRecords.length) {
      ;({ bounced: externalBounced, retriable } = await smtpRelay({
        messageId,
        sender,
        recipients,
        headerTo,
        subject,
        body,
        attachmentsRecords,
        failureRecords,
        inReplyTo,
        references,
      }))
    }
    // When its a fresh new job not retry attempt
    else {
      // Fetch attachments record from the database using attachment id
      attachmentsRecords = await loadAttachmentMetadata(attachments)

      // Seperate local domain recipients and external recipients
      const localRecipients = recipients.filter((r) =>
        domainEmailPattern.test(r),
      )

      const externalRecipients = recipients.filter(
        (r) => !domainEmailPattern.test(r),
      )

      // Asynchronously attempt to deliver local mails and external mails
      const results = await Promise.all([
        localRecipients.length // If local recipients exist, call local delivery agent
          ? localDeliveryAgent({
              threadId,
              emailId,
              recipients: localRecipients, // Only local recipients are passed
              sender,
              redis, // Shared redis connection (Will to used to notify the backend about a new mail arrival for a user)
            })
          : [],
        externalRecipients.length // If external recipents exist, call external mail delivery agent
          ? smtpRelay({
              messageId,
              sender,
              recipients: externalRecipients, // Only external recipients are passed
              headerTo,
              subject,
              body,
              attachmentsRecords,
              inReplyTo,
              references,
            })
          : { bounced: [], retriable: [] },
      ])

      localBounced = results[0] // Local delivery result containing array of recipients that were bounced
      externalResult = results[1] // External delivery result; includes bounced (rejected) recipients and retriable failures
      ;({ bounced: externalBounced, retriable } = externalResult)
    }

    // Merge bounced recipients from external and local delivery
    const bouncedMails = [...localBounced, ...externalBounced]

    // Call failure recorder if there exist bounced mails
    if (bouncedMails.length) {
      await failureRecorder({
        sender,
        emailId,
        threadId,
        bouncedRecipients: bouncedMails,
        type: 'BOUNCE',
        parentMessageId: messageId,
        redis,
      })
    }

    // Add to queue again if the delivery can be retried
    if (retriable.length && retryCount < 3) {
      await outboundEmailQueue.add(
        'outboundEmailQueue',
        {
          ...job.data,
          retryCount: retryCount + 1, // Increment retry count
          attachmentsRecords, // Earlier fetched record from db to prevent fetching again
          failureRecords: retriable, // Failed recipients
        },
        { delay: 1 * 20 * 1000 }, // Delay between each retry
      )
    }

    // If still cannot be delivered after 3 attempts, call failure recorder with type of DELIVERY
    if (retriable.length && retryCount >= 3) {
      await failureRecorder({
        sender,
        emailId,
        threadId,
        bouncedRecipients: retriable,
        type: 'DELIVERY',
        parentMessageId: messageId,
        redis,
      })
    }
  },
  {
    connection: redis,
    concurrency: 10, // Number of concurrent jobs this worker can process
    attempts: 1,
  },
)

console.log('Outbound worker is ready')

outboundEmailWorker.on('completed', (job) => {
  console.log('Job Completed', job.id)
})

outboundEmailWorker.on('error', (job, err) => {
  console.log('Error:', err)
})

outboundEmailWorker.on('failed', async (job, err) => {
  console.log('Failed:', err)
})
