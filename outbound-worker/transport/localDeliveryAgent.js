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
  redis,
}) => {
  let localBouncedMails = []

  // Find user that exist
  const existingUsers = await User.find(
    { emailAddress: { $in: recipients } },
    { _id: 1, emailAddress: 1, name: 1 },
  )

  // Create a map of recipients email address to their name
  const emailToNameMap = Object.fromEntries(
    existingUsers.map((u) => [u.emailAddress, u.name]),
  )

  // Find the email that the sender sent (The same email is shared across all local recipients)
  const email = await Email.findById(emailId)

  // Update the 'TO' of email to include name of recipients
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

  // Find valid userid and valid email address from the existing user
  const validUserIds = existingUsers.map((u) => u._id)
  const validEmailAddresses = existingUsers.map((u) => u.emailAddress)

  // Find the local recipients that are not in valid email address
  const bounced = recipients.filter((r) => !validEmailAddresses.includes(r))

  // Push to local bounced mail array
  if (bounced.length > 0) {
    localBouncedMails.push({
      addresses: [bounced],
    })
  }
  // Update the mailbox of valid users to include the email
  if (validUserIds?.length > 0) {
    Mailbox.bulkWrite(
      validUserIds.map((userId) => ({
        updateOne: {
          filter: { threadId, userId }, // Find using threadId and userId (if not found upsert will create a new one)
          update: {
            $set: {
              lastMessageAt: Date.now(),
              isRead: false,
            },
            $addToSet: {
              labels: 'INBOX', // Add label inbox
            },
            $setOnInsert: {
              subject: email.subject, // Set subject when a new mailbox is created(ignored if the mailbox already exist)
            },
            $push: { emailIds: emailId }, // Include the emailId of the recieved mail
          },
          upsert: true, // Create a new one if it doesnot exist
        },
      })),
    )

    // Add to recipient history (Will be used for recipent suggestion when writing a new mail)
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
          upsert: true, // Create a new one if it doesnot exist
        },
      })),
    )

    // Fetched for notifying the recipients
    const mailboxEntries = await Mailbox.find({
      threadId,
      userId: { $in: validUserIds },
    })

    // Fetched for notifying the recipients
    const thread = await Thread.findById(threadId, {
      senders: 1,
      _id: 0,
    })

    // Create new notifications for each mailbox entries
    const notifications = mailboxEntries.flatMap((result) => {
      if (result.isDeleted) return [] // If mail is in trash for a user, don't notify
      return {
        userId: String(result.userId),
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

    // Call notify user
    await notifyUser(notifications, redis)
  }

  // Return back the local bounced recipients
  return localBouncedMails
}

export default localDeliveryAgent
