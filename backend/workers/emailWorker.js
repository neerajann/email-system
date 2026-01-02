import './envConfig.js'
import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'
import Attachment from '../src/models/attachmentSchema.js'
import mongoose from 'mongoose'
import convertToArray from '../src/utils/convertToArray.js'
import Email from '../src/models/emailSchema.js'
import Mailbox from '../src/models/mailboxSchema.js'
import User from '../src/models/userSchema.js'
import { domainEmailPattern } from '../src/utils/pattern.js'
import Thread from '../src/models/threadSchema.js'

await mongoose.connect(process.env.MONGO_DB_URL)

const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

const transporter = nodemailer.createTransport(
  directTransport({
    name: process.env.DOMAIN_NAME,
    debug: true,

    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  })
)

const emailWorker = new Worker(
  'emailQueue',
  async ({
    data: {
      threadId,
      emailId,
      messageId,
      senderId,
      sender,
      recipients,
      subject,
      body,
      attachments,
    },
  }) => {
    let attachmentsRecords = []
    if (attachments) {
      var filteredAttachmentId = convertToArray(attachments)
    }

    if (filteredAttachmentId?.length) {
      await Attachment.updateMany(
        {
          _id: { $in: filteredAttachmentId },
        },
        {
          $set: {
            status: 'attached',
          },
        }
      ),
        (attachmentsRecords = await Attachment.find(
          {
            _id: { $in: filteredAttachmentId },
          },
          {
            originalName: 1,
            _id: 0,
            encoding: 1,
            path: 1,
          }
        ))
    }

    const localDomainEmails = recipients.filter((t) =>
      domainEmailPattern.test(t)
    )
    var externalEmails = recipients.filter((t) => !domainEmailPattern.test(t))

    const results = await Promise.allSettled([
      localDomainEmails?.length
        ? await handleLocalMails({ emailId, recipients: localDomainEmails })
        : Promise.resolve([]),

      externalEmails?.length
        ? await handleExternalMails({
            messageId,
            sender,
            recipients: externalEmails,
            subject,
            body,
            attachmentsRecords,
          })
        : Promise.resolve([]),
    ])
    const localBouncedMails =
      results[0].status === 'fulfilled' ? results[0].value : []
    const externalBouncedMails =
      results[1].status === 'fulfilled' ? results[1].value : []

    const bouncedMails = [...localBouncedMails, ...externalBouncedMails]

    await handleBouncedMails({
      senderId,
      sender,
      emailId,
      threadId,
      bouncedMails,
    })
  },
  { connection, concurrency: 5 }
)

emailWorker.on('completed', (job) => {
  console.log('job completed', job.id)
})

emailWorker.on('error', (job, err) => {
  console.log(err)
  console.log(job)
})

emailWorker.on('failed', (job, err) => {
  console.log(err)
  console.log(job.failedReason)
})

const handleLocalMails = async ({ emailId, recipients }) => {
  const existingUsers = await User.find(
    { emailAddress: { $in: recipients } },
    { _id: 1, emailAddress: 1 }
  )

  const validUserIds = existingUsers.map((u) => u._id)
  const validEmailAddresses = existingUsers.map((u) => u.emailAddress)

  const localBouncedMails = recipients.filter(
    (r) => !validEmailAddresses.includes(r)
  )

  if (validUserIds?.length > 0) {
    const mailboxEntries = validUserIds.map((userId) => ({
      userId: userId,
      emailId: emailId,
      labels: ['INBOX'],
    }))

    await Mailbox.insertMany(mailboxEntries)
  }

  return localBouncedMails
}

const handleExternalMails = async ({
  messageId,
  sender,
  recipients,
  subject,
  body,
  attachmentsRecords,
}) => {
  var attachments = attachmentsRecords?.map((record) => {
    return {
      filename: record.originalName,
      encoding: record.encoding,
      path: record.path,
    }
  })
  const info = await transporter.sendMail({
    from: sender,
    to: recipients,
    messageId: messageId,
    subject: subject,
    text: body,
    attachments: attachments,
  })
  return info.rejected
}

const handleBouncedMails = async ({
  senderId,
  sender,
  emailId,
  threadId,
  bouncedMails,
}) => {
  console.log(threadId)
  let bounceEntries = []
  if (bouncedMails?.length) {
    bouncedMails.forEach((recipient) => {
      const systemMessageId = `<system-${crypto.randomUUID()}@${
        process.env.DOMAIN_NAME
      }>`

      const body = generateBounceHtml(recipient, 'Mail Delivery Failed')
      bounceEntries.push({
        threadId: threadId,
        messageId: systemMessageId,
        to: sender,
        from: 'mailer-daemon@inboxify.com ',
        subject: 'Mail Delivery Failed',
        body: body,
        isSystem: true,
        bounceFor: emailId,
      })
    })

    if (bounceEntries?.length) {
      const createdEmails = await Email.insertMany(bounceEntries)
      const mailboxRecords = createdEmails.map((email) => {
        return {
          threadId: threadId,
          userId: senderId,
          emailId: email._id,
          labels: ['SYSTEM', 'INBOX'],
        }
      })
      await Mailbox.insertMany(mailboxRecords)
      await Thread.findByIdAndUpdate(threadId, {
        lastMessageAt: new Date(),
        $inc: {
          messageCount: createdEmails?.length,
        },
      })
    }
    return true
  }
}

const generateBounceHtml = (recipient, subject) => {
  return `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #f5f5f5; padding: 20px; border-bottom: 1px solid #e0e0e0;">
      <h2 style="margin: 0; color: #d93025; font-size: 18px; display: flex; align-items: center;">
        <span style="margin-right: 10px;">⚠️</span> Delivery Status Notification (Failure)
      </h2>
    </div>

    <div style="padding: 24px; color: #3c4043; line-height: 1.5;">
      <p style="margin-top: 0;">Your message wasn't delivered to <strong>${recipient}</strong> because the address couldn't be found, or is unable to receive mail.</p>
      
      <div style="background-color: #fff4f2; border-left: 4px solid #d93025; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #a50e0e;">The response from the remote server was:</p>
        <p style="margin: 5px 0 0 0; font-family: monospace; color: #5f6368;">550 5.1.1 The email account that you tried to reach does not exist.</p>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

      <table style="width: 100%; font-size: 13px; color: #70757a;">
        <tr>
          <td style="padding-bottom: 5px; width: 80px;"><strong>Subject:</strong></td>
          <td>${subject}</td>
        </tr>
        <tr>
          <td><strong>To:</strong></td>
          <td>${recipient}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #70757a;">
      This is an automated system message from <strong>${process.env.DOMAIN_NAME}</strong>.
    </div>
  </div>
  `
}
