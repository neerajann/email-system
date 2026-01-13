import mongoose from 'mongoose'
import { Mailbox } from '@email-system/core/models'

const patchMail = async ({ userId, threadId, data }) => {
  const result = await Mailbox.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      threadId: new mongoose.Types.ObjectId(threadId),
    },
    {
      $set: data,
    },
    {
      sort: { receivedAt: -1 },
      projection: { _id: 1 },
    }
  )

  if (!result) throw new Error('EMAIL_NOT_FOUND')
  return true
}

const deleteMail = async ({ userId, threadId }) => {
  const result = await Mailbox.deleteMany({
    userId: new mongoose.Types.ObjectId(userId),
    threadId: new mongoose.Types.ObjectId(threadId),
  })
  if (result.deletedCount === 0) throw new Error('EMAIL_NOT_FOUND')
  return true
}

export default { deleteMail, patchMail }
