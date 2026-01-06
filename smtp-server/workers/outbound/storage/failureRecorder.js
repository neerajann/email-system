import { Mailbox, Thread, Email } from '@email-system/core/models'
import {
  generateBounceHtml,
  generateDeliveryFailureHtml,
} from '../assembly/DSNComposer.js'
import { htmlToText } from 'html-to-text'

const failureRecorder = async ({
  sender,
  emailId,
  threadId,
  bouncedRecipients,
  type,
}) => {
  let failureEntries = []
  const allMessageIds = []
  const pushFailureEntry = (subject, html) => {
    const systemMessageId = `<system-${crypto.randomUUID()}@${
      process.env.DOMAIN_NAME
    }>`
    allMessageId.push(systemMessageId)

    const text = htmlToText(html)
    failureEntries.push({
      threadId: threadId,
      messageId: systemMessageId,
      to: {
        address: sender.address,
        name: sender.name,
      },
      from: {
        address: 'mailer-daemon@inboxify.com ',
        name: 'Mail Delivery Subsystem',
      },

      subject: subject,
      body: {
        html: html,
        text: text,
      },
      isSystem: true,
      bounceFor: emailId,
    })
  }

  if (type === 'DELIVERY') {
    for (const entry of bouncedRecipients) {
      entry.emails.forEach((recipient) => {
        const html = generateDeliveryFailureHtml(recipient)
        const subject = 'Delivery Delayed: Message Could Not Be Delivered'
        pushFailureEntry(subject, html)
      })
    }
  } else if (type === 'BOUNCE') {
    bouncedRecipients.forEach((recipient) => {
      const html = generateBounceHtml(recipient)
      const subject = 'Mail Delivery Failed: Address Not Found'
      pushFailureEntry(subject, html)
    })
  }

  const createdEmails = await Email.insertMany(failureEntries)
  const mailboxRecords = createdEmails.map((email) => {
    return {
      threadId: threadId,
      userId: sender.id,
      emailId: email._id,
      labels: ['SYSTEM', 'INBOX'],
    }
  })
  await Mailbox.insertMany(mailboxRecords)
  await Thread.findByIdAndUpdate(threadId, {
    $set: {
      lastMessageAt: new Date(),
    },
    $inc: {
      messageCount: createdEmails?.length,
    },
    $push: {
      messageIds: allMessageIds,
    },
  })
  console.log('Failure message sent:', bouncedRecipients)
  return true
}
export default failureRecorder
