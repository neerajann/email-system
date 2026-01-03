import Mailbox from '../../../src/models/mailboxSchema.js'
import Thread from '../../../src/models/threadSchema.js'
import Email from '../../../src/models/emailSchema.js'
import { generateBounceHtml } from './generateHtml.js'
import { generateDeliveryFailureHtml } from './generateHtml.js'
import { htmlToText } from 'html-to-text'

const sendFailureMessage = async ({
  senderId,
  sender,
  emailId,
  threadId,
  recipients,
  type,
  error,
}) => {
  let failureEntries = []
  recipients.forEach((recipient) => {
    const systemMessageId = `<system-${crypto.randomUUID()}@${
      process.env.DOMAIN_NAME
    }>`
    if (type === 'BOUNCE') {
      var html = generateBounceHtml(recipient, error)
      var text = htmlToText(html)
      var subject = 'Mail Delivery Failed: Address Not Found'
    } else if (type === 'DELIVERY') {
      var html = generateDeliveryFailureHtml(recipient)
      var text = htmlToText(html)
      var subject = 'Delivery Delayed: Message Could Not Be Delivered'
    }
    failureEntries.push({
      threadId: threadId,
      messageId: systemMessageId,
      to: sender,
      from: 'mailer-daemon@inboxify.com ',
      subject: subject,
      body: {
        html: html,
        text: text,
      },
      isSystem: true,
      bounceFor: emailId,
    })
  })

  const createdEmails = await Email.insertMany(failureEntries)
  const mailboxRecords = createdEmails.map((email) => {
    return {
      threadId: threadId,
      userId: senderId,
      emailId: email._id,
      labels: ['SYSTEM', 'INBOX'],
    }
  })
  await Mailbox.insertMany(mailboxRecords)
  await Thread.findByIdAndUpdate(threadId, {
    lastMessageAt: new Date(),
    $inc: {
      messageCount: createdEmails?.length,
    },
  })
  console.log('Failure message sent')
  return true
}
export default sendFailureMessage
