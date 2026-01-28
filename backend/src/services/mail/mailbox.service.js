import mongoose from 'mongoose'
import { Mailbox } from '@email-system/core/models'

const patchMail = async ({ userId, mailboxIds, data }) => {
  const mailboxIdsObject = mailboxIds.map((i) => new mongoose.Types.ObjectId(i))
  const result = await Mailbox.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      _id: {
        $in: mailboxIdsObject,
      },
    },
    {
      $set: data,
    },
  )

  if (result.matchedCount < 0) throw new Error('EMAIL_NOT_FOUND')
  return true
}

const deleteMail = async ({ userId, mailboxId }) => {
  const result = await Mailbox.deleteMany({
    userId: new mongoose.Types.ObjectId(userId),
    _id: new mongoose.Types.ObjectId(mailboxId),
  })
  if (result.deletedCount === 0) throw new Error('EMAIL_NOT_FOUND')
  return true
}

export default { deleteMail, patchMail }
