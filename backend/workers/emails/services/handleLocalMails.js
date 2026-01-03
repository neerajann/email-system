import Mailbox from '../../../src/models/mailboxSchema.js'
import User from '../../../src/models/userSchema.js'

const handleLocalMails = async ({ threadId, emailId, recipients }) => {
  let localBouncedMails = []
  const existingUsers = await User.find(
    { emailAddress: { $in: recipients } },
    { _id: 1, emailAddress: 1 }
  )

  const validUserIds = existingUsers.map((u) => u._id)
  const validEmailAddresses = existingUsers.map((u) => u.emailAddress)

  localBouncedMails = recipients.filter((r) => !validEmailAddresses.includes(r))

  if (validUserIds?.length > 0) {
    const mailboxEntries = validUserIds.map((userId) => ({
      threadId: threadId,
      userId: userId,
      emailId: emailId,
      labels: ['INBOX'],
    }))

    await Mailbox.insertMany(mailboxEntries)
  }

  return localBouncedMails
}
export default handleLocalMails
