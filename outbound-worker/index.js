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
const outboundEmailQueue = createOutboundEmailQueue(redis)
await connectDB()

const outboundEmailWorker = new Worker(
  'outboundEmailQueue',
  async (job) => {
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
      attachmentsRecords: cachedAttachments,
      retryCount = 1,
      failureRecords = [],
    } = job.data

    let retriable = []
    let externalBounced = []
    let localBounced = []
    let externalResult = { bounced: [], retriable: [] }
    let attachmentsRecords = cachedAttachments

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
    } else {
      attachmentsRecords = await loadAttachmentMetadata(attachments)

      const localRecipients = recipients.filter((r) =>
        domainEmailPattern.test(r),
      )

      const externalRecipients = recipients.filter(
        (r) => !domainEmailPattern.test(r),
      )

      const results = await Promise.all([
        localRecipients.length
          ? localDeliveryAgent({
              threadId,
              emailId,
              recipients: localRecipients,
              sender,
              redis,
            })
          : [],
        externalRecipients.length
          ? smtpRelay({
              messageId,
              sender,
              recipients: externalRecipients,
              headerTo,
              subject,
              body,
              attachmentsRecords,
              inReplyTo,
              references,
            })
          : { bounced: [], retriable: [] },
      ])

      localBounced = results[0]
      externalResult = results[1]
      ;({ bounced: externalBounced, retriable } = externalResult)
    }

    const bouncedMails = [...localBounced, ...externalBounced]

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

    if (retriable.length && retryCount < 3) {
      await outboundEmailQueue.add(
        'outboundEmailQueue',
        {
          ...job.data,
          retryCount: retryCount + 1,
          attachmentsRecords,
          failureRecords: retriable,
        },
        { delay: 1 * 20 * 1000 },
      )
    }

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
    concurrency: 10,
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
