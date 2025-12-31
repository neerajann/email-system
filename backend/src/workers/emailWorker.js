import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import env from 'dotenv'
import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'

env.config()

const connection = new IORedis({ maxRetriesPerRequest: null })

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
    console.log(job)
    await transporter.sendMail({
      from: job.data.from,
      to: job.data.to,
      subject: job.data.subject,
      text: job.data.body,
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
