import { Mailbox, User, Email, Thread } from '@email-system/core/models'
import mongoose from 'mongoose'
import notifyUser from '../../notifyUser.js'

const localDeliveryAgent = async ({ threadId, emailId, recipients }) => {
  let localBouncedMails = []

  const existingUsers = await User.find(
    { emailAddress: { $in: recipients } },
    { _id: 1, emailAddress: 1, name: 1 },
  )

  console.log('exisiting users:', existingUsers)

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

  localBouncedMails.push(
    ...recipients.filter((r) => !validEmailAddresses.includes(r)),
  )

  if (validUserIds?.length > 0) {
    const ops = validUserIds.map((userId) => ({
      updateOne: {
        filter: { threadId, userId },
        update: {
          $set: {
            lastMessageAt: Date.now(),
            isRead: false,
          },
          $addToSet: { labels: 'INBOX' },
          $push: { emailIds: emailId },
        },
        upsert: true,
      },
    }))
    await Mailbox.bulkWrite(ops)

    const mailboxEntries = await Mailbox.find({
      threadId,
      userId: { $in: validUserIds },
    })

    const thread = await Thread.findById(threadId, {
      messageCount: 1,
    })

    const notifications = mailboxEntries.flatMap((result) => {
      if (result.isDeleted) return []
      return {
        userId: result.userId,
        newMail: {
          threadId: threadId,
          from: email.from,
          to: email.to,
          subject: email.subject,
          snippet: email.body?.text?.substring(0, 200) ?? ' ',
          isSystem: false,
          messageCount: thread.messageCount,
          isRead: false,
          isStarred: result.isStarred,
          receivedAt: email.receivedAt,
          isDeleted: false,
        },
      }
    })
    await notifyUser(notifications)
  }

  return localBouncedMails
}

export default localDeliveryAgent
