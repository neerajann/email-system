import crypto from 'crypto'
import mongoose from 'mongoose'
import processEmail from './emailProcessing.service.js'
import { validateAttachments, validateUser } from './emailValidation.service.js'
import {
  createEmail,
  createThread,
  handleReply,
} from './threadManagement.service.js'
import {
  queueOutboundEmail,
  sendNotfication,
  updateRecipientHistory,
  updateSenderMailbox,
} from './mailboxManagement.service.js'
const deliverMail = async ({
  senderId,
  senderAddress,
  recipients,
  subject,
  body,
  attachments,
  emailId,
}) => {
  //sanitizes the email body to prevent against xss
  const { bodyHtml, bodyText } = processEmail(body)
  const messageId = `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  try {
    //Additional checks to make sure that the user exists( infuture it could be like if user has enough storage or not as well)
    const userInfo = await validateUser(senderId, senderAddress)

    //convert attachment id's into mongoose object id and filter invalid ones
    const parsedAttachments = attachments?.length
      ? await validateAttachments(attachments)
      : []

    let thread
    let email

    // If emailid is present, it's a reply mail
    if (emailId) {
      const result = await handleReply({
        emailId,
        senderAddress,
        userInfo,
        recipients,
        messageId,
        bodyHtml,
        bodyText,
        parsedAttachments,
      })
      thread = result.thread
      email = result.email
    } else {
      // Else it's a new mail, so create a new thread for it
      thread = await createThread({
        senderAddress,
        senderName: userInfo.name,
        recipients,
      })
      // Create a new email in Email collection
      email = await createEmail({
        threadId: thread._id,
        senderAddress,
        senderName: userInfo.name,
        recipients,
        messageId,
        subject: subject,
        bodyHtml,
        bodyText,
        attachments: parsedAttachments,
      })
    }

    const senderInRecipent = recipients.includes(senderAddress) // Check if the sender's address is also included in the recipient list
    // Update the sender mailbox to contain the created email
    const mailbox = await updateSenderMailbox({
      userId: userInfo._id,
      threadId: thread._id,
      emailId: email._id,
      subject: email.subject,
      senderInRecipent, // This will be used to determine the label (if sender is in recipient as well, it will should be in both inbox,sent)
    })

    // Add recipients to history for auto suggestion for recipients
    await updateRecipientHistory(userInfo._id, recipients)

    // Notify the user about new mail if the sender was also in recipients
    if (senderInRecipent) {
      await sendNotfication({
        senderId,
        mailbox,
        thread,
        email,
      })
    }

    // Exclude the sender's address from the recipient list.
    // If the sender included themselves, it's handled earlier while creating the mailbox for the sender
    // Prevent duplicate mailbox entries and avoid unnecessary delivery queue processing.
    const externalRecipients = recipients.filter((r) => r != senderAddress)
    // After adding the mail to queue the backend completed its task of handling the mail
    // So frontend sees immediate response that mail was sent
    if (externalRecipients.length > 0) {
      await queueOutboundEmail({
        email,
        thread,
        userInfo,
        senderAddress,
        externalRecipients,
        allRecipients: recipients,
      })
    }
  } catch (error) {
    console.log(error)
    if (error instanceof mongoose.Error) throw new Error('DATABASE_ERROR')
    throw error
  }
}

export default deliverMail
