import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'
import Attachment from '../models/attachmentSchema.js'
import mongoose from 'mongoose'
import convertToArray from '../utils/convertToArray.js'
import env from 'dotenv'

env.config({ quiet: true })
await mongoose.connect(process.env.MONGO_DB_URL)

const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_ADDRESS,
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
  async (job) => {
    if (job.data.attachments) {
      var filteredAttachmentId = convertToArray(job.data.attachments)
    }

    if (filteredAttachmentId.length > 0) {
      const [, attachmentsRecords] = await Promise.all([
        Attachment.updateMany(
          {
            _id: { $in: filteredAttachmentId },
          },
          {
            $set: {
              status: 'attached',
            },
          }
        ),
        Attachment.find(
          {
            _id: { $in: filteredAttachmentId },
          },
          {
            originalName: 1,
            _id: 0,
            encoding: 1,
            path: 1,
          }
        ),
      ])

      var attachments = attachmentsRecords?.map((record) => {
        return {
          filename: record.originalName,
          encoding: record.encoding,
          path: record.path,
        }
      })
    }
    await transporter.sendMail({
      from: job.data.from,
      to: job.data.to,
      subject: job.data.subject,
      text: job.data.body,
      attachments,
    })
  },
  { connection, concurrency: 5 }
)

emailWorker.on('completed', (job) => {
  console.log('job completed', job.id)
})

emailWorker.on('error', (job, err) => {
  console.log(err)
})

emailWorker.on('failed', (job, err) => {
  console.log(job.failedReason)
})
