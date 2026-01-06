import { Mailbox, User, Email } from '@email-system/core/models'

const localDeliveryAgent = async ({ threadId, emailId, recipients }) => {
  let localBouncedMails = []

  const existingUsers = await User.find(
    { emailAddress: { $in: recipients } },
    { _id: 1, emailAddress: 1, firstName: 1 }
  )
  const emailToNameMap = existingUsers.reduce(({ acc, user }) => {
    acc[user.emailAddress] = user.firstName
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

  const validUserIds = existingUsers.map((u) => u._id)
  const validEmailAddresses = existingUsers.map((u) => u.emailAddress)

  localBouncedMails.push(
    ...recipients.filter((r) => !validEmailAddresses.includes(r))
  )

  if (validUserIds?.length > 0) {
    const mailboxEntries = validUserIds.map((userId) => ({
      threadId: threadId,
      userId: userId,
      emailId: emailId,
      labels: ['INBOX'],
    }))

    await Mailbox.insertMany(mailboxEntries)
  }
  console.log(localBouncedMails)
  return localBouncedMails
}

export default localDeliveryAgent
