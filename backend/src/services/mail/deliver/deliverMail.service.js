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

    if (emailId) {
      //handle reply mail
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
      //create a new thread and a new email
      thread = await createThread({
        senderAddress,
        senderName: userInfo.name,
        recipients,
      })

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

    //update the sender mailbox to contain the created email
    const senderInRecipent = recipients.includes(senderAddress)
    const mailbox = await updateSenderMailbox({
      userId: userInfo._id,
      threadId: thread._id,
      emailId: email._id,
      subject: email.subject,
      senderInRecipent,
    })

    // add recipients to history for auto suggestion for recipients
    await updateRecipientHistory(userInfo._id, recipients)

    //notify the user if the was also in recipients
    if (senderInRecipent) {
      await sendNotfication({
        senderId,
        mailbox,
        thread,
        email,
      })
    }

    //filter out the recipients to not contain the recipent
    const externalRecipients = recipients.filter((r) => r != senderAddress)
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
