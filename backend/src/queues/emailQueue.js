import { Queue } from 'bullmq'

const emailQueue = new Queue('emailQueue', {
  connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
})

export default emailQueue
