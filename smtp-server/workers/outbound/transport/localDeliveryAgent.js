import notifyUser from '@email-system/core/messaging'
import {
  Mailbox,
  User,
  Email,
  Thread,
  RecipientHistory,
} from '@email-system/core/models'
import mongoose from 'mongoose'

const localDeliveryAgent = async ({
  threadId,
  emailId,
  recipients,
  sender,
}) => {
  let localBouncedMails = []

  const existingUsers = await User.find(
    { emailAddress: { $in: recipients } },
    { _id: 1, emailAddress: 1, name: 1 },
  )

  const emailToNameMap = existingUsers.reduce((acc, user) => {
    acc[user.emailAddress] = user.name
    return acc
  }, {})

  const email = await Email.findById(emailId)

  email.to = email.to.map((recipient) => {
    if (emailToNameMap[recipient.address]) {
      return {
        ...recipient,
        name: emailToNameMap[recipient.address],
      }
    }
    return recipient
  })

  await email.save()

  const validUserIds = existingUsers.map(
    (u) => new mongoose.Types.ObjectId(u._id),
  )
  const validEmailAddresses = existingUsers.map((u) => u.emailAddress)

  const bounced = recipients.filter((r) => !validEmailAddresses.includes(r))

  if (bounced.length > 0) {
    localBouncedMails.push({
      addresses: [bounced],
    })
  }

  if (validUserIds?.length > 0) {
    Mailbox.bulkWrite(
      validUserIds.map((userId) => ({
        updateOne: {
          filter: { threadId, userId },
          update: {
            $set: {
              lastMessageAt: Date.now(),
              isRead: false,
            },
            $addToSet: {
              labels: 'INBOX',
            },
            $setOnInsert: {
              subject: email.subject,
            },
            $push: { emailIds: emailId },
          },
          upsert: true,
        },
      })),
    )

    await RecipientHistory.bulkWrite(
      existingUsers.map((user) => ({
        updateOne: {
          filter: {
            ownerUserId: user._id,
            emailAddress: sender.address,
          },
          update: {
            $inc: {
              receivedCount: 1,
            },
          },
          upsert: true,
        },
      })),
    )

    const mailboxEntries = await Mailbox.find({
      threadId,
      userId: { $in: validUserIds },
    })

    const thread = await Thread.findById(threadId, {
      senders: 1,
      _id: 0,
    })

    const notifications = mailboxEntries.flatMap((result) => {
      if (result.isDeleted) return []
      return {
        userId: result.userId,
        newMail: {
          mailboxId: result._id,
          from: thread.senders,
          subject: result.subject,
          snippet: email.body?.text?.substring(0, 200) ?? ' ',
          isSystem: false,
          messageCount: result.emailIds.length,
          isRead: false,
          isStarred: result.isStarred,
          receivedAt: result.lastMessageAt,
          isDeleted: false,
        },
      }
    })
    await notifyUser(notifications)
  }

  return localBouncedMails
}

export default localDeliveryAgent
