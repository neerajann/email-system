import mongoose from 'mongoose'
import { Mailbox } from '@email-system/core/models'

const moveToTrash = async (threadId, userId) => {
  const result = await Mailbox.updateMany(
    {
      threadId: new mongoose.Types.ObjectId(threadId),
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
      },
      $addToSet: {
        labels: 'TRASH',
      },
    }
  )
  if (result.modifiedCount == 0) throw new Error('EMAIL_NOT_FOUND')
  return true
}

const restoreMail = async (threadId, userId) => {
  const result = await Mailbox.updateMany(
    {
      threadId: new mongoose.Types.ObjectId(threadId),
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: true,
    },
    {
      $set: {
        isDeleted: false,
      },
      $pull: {
        labels: 'TRASH',
      },
    }
  )
  if (result.modifiedCount == 0) throw new Error('EMAIL_NOT_FOUND')
  return true
}

export default { moveToTrash, restoreMail }
