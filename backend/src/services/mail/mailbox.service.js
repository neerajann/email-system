import mongoose from 'mongoose'
import { Mailbox } from '@email-system/core/models'

const patchMail = async ({ userId, threadIds, data }) => {
  const threadIdObjects = threadIds.map((t) => new mongoose.Types.ObjectId(t))
  const result = await Mailbox.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      threadId: {
        $in: threadIdObjects,
      },
    },
    {
      $set: data,
    },
  )

  if (result.matchedCount < 0) throw new Error('EMAIL_NOT_FOUND')
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
