import { Queue } from 'bullmq'

const emailQueue = new Queue('emailQueue')

export default emailQueue
