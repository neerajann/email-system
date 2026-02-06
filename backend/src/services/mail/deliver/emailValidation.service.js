import { Attachment, User } from '@email-system/core/models'
import mongoose from 'mongoose'

const validateUser = async (senderId, senderAddress) => {
  const userInfo = await User.findOne(
    {
      emailAddress: senderAddress,
      _id: senderId,
    },
    {
      name: 1,
      emailAddress: 1,
    },
  )

  if (!userInfo) throw new Error('USER_NOT_FOUND')

  return userInfo
}

const validateAttachments = async (attachments) => {
  const parsedAttachments = attachments?.map(
    (id) => new mongoose.Types.ObjectId(id),
  )

  const count = await Attachment.countDocuments({
    _id: {
      $in: parsedAttachments,
    },
  })

  if (parsedAttachments.length !== count) {
    throw new Error('INVALID_ATTACHMENTS')
  }

  return parsedAttachments
}

export { validateUser, validateAttachments }
