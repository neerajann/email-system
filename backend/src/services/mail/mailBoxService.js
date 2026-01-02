import Mailbox from '../../models/mailboxSchema.js'

const moveToTrash = async (mailboxId, userId) => {
  const result = await Mailbox.updateOne(
    {
      _id: mailboxId,
      userId: userId,
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

const restoreMail = async (mailboxId, userId) => {
  const result = await Mailbox.updateOne(
    {
      _id: mailboxId,
      userId: userId,
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
