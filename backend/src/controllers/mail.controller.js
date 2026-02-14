import deliverMail from '../services/mail/deliver/deliverMail.service.js'
import mailBoxService from '../services/mail/mailbox.service.js'
import fetchMailService from '../services/mail/fetch.mail.service.js'
import handleMailError from '../utils/handleMailError.js'
import mongoose from 'mongoose'
import recipientsSuggestionService from '../services/mail/recipients.suggestion.service.js'

// Get list of mails received by user
const getInbox = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : [] // Split the cursor; it's like: lastMailId_lastMailDate
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])
    const emails = await fetchMailService.getMails({
      userId: req.userId, // Comes from verifyJWT middleware
      label: 'INBOX',
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate, // Check if cursor date is a valid date
    })

    if (!emails)
      return reply.code(200).send({ message: 'No emails at the moment' })

    return reply.send(emails)
  } catch (error) {
    console.log(error)
    reply.code(500).send({ error: 'Something went wrong' })
  }
}

// Get list of mails sent by user
const getSent = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : [] // Split the cursor; it's like: lastMailId_lastMailDate
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])

    const emails = await fetchMailService.getMails({
      userId: req.userId, // Comes from verifyJWT middleware
      label: 'SENT',
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate, // Check if cursor date is a valid date
    })

    if (!emails)
      return reply
        .code(200)
        .send({ message: "You haven't sent any emails yet" })
    return reply.send(emails)
  } catch (error) {
    console.log(error)
    reply.code(500).send({ error: 'Something went wrong' })
  }
}

// Get list of  mails in trash for a user
const getTrash = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : [] // Split the cursor; it's like: lastMailId_lastMailDate
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])

    const emails = await fetchMailService.getMails({
      userId: req.userId, // Comes from verifyJWT middleware
      trash: true,
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate, // Check if cursor date is a valid date
    })

    if (!emails)
      return reply.code(200).send({ message: 'No conversations in Trash.' })
    return reply.send(emails)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
  }
}

// Get list of starred mails from user mailboxes
const getStarred = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : [] // Split the cursor; it's like: lastMailId_lastMailDate
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])

    const emails = await fetchMailService.getMails({
      userId: req.userId, // Comes from verifyJWT middleware
      starred: true,
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate, // Check if cursor date is a valid date
    })

    if (!emails)
      return reply.code(200).send({ message: 'No conversations in Starred.' })
    return reply.send(emails)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
  }
}

// Get individual mail
const getMail = async (req, reply) => {
  try {
    const mail = await fetchMailService.getMail(req.userId, req.mailboxId) // Mailbox Id comes from verify objectId middleware
    return reply.send(mail)
  } catch (error) {
    handleMailError(reply, error) // Centralized error handler
  }
}

// Controller to handle new mail,mail reply,forwarding
const sendMail = async (req, reply) => {
  try {
    // Convert all recipients to lower case and trim space
    const recipients = req.body.recipients.map((recipient) => {
      return recipient.toLowerCase().trim()
    })

    const subject = req.body?.subject
    const body = req.body?.body
    const attachments = req.body?.attachments
    const emailId = req.body?.emailId

    await deliverMail({
      senderId: req.userId,
      senderAddress: req.user,
      recipients,
      subject,
      body,
      attachments,
      emailId,
    })

    reply.code(200).send({ success: 'Mail has been sent.' })
  } catch (error) {
    handleMailError(reply, error)
  }
}

// Controller to handle mail searching
const searchMail = async (req, reply) => {
  try {
    const query = req.query?.q
    if (!query)
      return reply.code(400).send({ error: 'Missing query parameter' })

    const cursor = req.query?.cursor ? req.query.cursor.split('_') : [] // Cursor
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null

    const cursorDate = new Date(cursor[1])

    const emails = await fetchMailService.searchMail({
      query,
      user: req.user,
      userId: req.userId,
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate,
    })
    if (!emails)
      return reply.code(200).send({
        message: 'No email matched your search',
      })
    return reply.code(200).send(emails)
  } catch (error) {
    handleMailError(reply, error)
  }
}

// Controller to handle operation like read/unread, trash, star/unstar
const patchMail = async (req, reply) => {
  try {
    const mailboxIds = req.body.mailboxIds // Verified by schema that all are valid object id's
    await mailBoxService.patchMail({
      mailboxIds,
      userId: req.userId,
      data: req.body, // Everything is verified by schema defined so it can be trusted
    })
    return reply.code(200).send({
      success: 'The operation was successful.',
    })
  } catch (error) {
    handleMailError(reply, error)
  }
}

// Delete a mail(mailbox) owned by a user
const deleteMail = async (req, reply) => {
  try {
    const mailboxId = req.mailboxId // Verified by verify object id middleware
    await mailBoxService.deleteMail({ userId: req.userId, mailboxId })
    return reply.code(200).send({
      success: 'The mail has been deleted successfully.',
    })
  } catch (error) {
    handleMailError(reply, error) // Error will be thrown if mailbox not found
  }
}

// Controller to handle recipients suggestions
const getRecipientsSuggestion = async (req, reply) => {
  try {
    const query = req.query?.q
    if (!query) {
      return reply.code(400).send({
        error: 'Missing query parameter',
      })
    }
    const suggestions = await recipientsSuggestionService.suggestRecipients({
      userId: req.userId,
      query,
    })
    return reply.send(suggestions)
  } catch (error) {
    console.log(error)
    handleMailError(reply, error)
  }
}
export default {
  getInbox,
  getSent,
  getTrash,
  sendMail,
  getMail,
  patchMail,
  searchMail,
  deleteMail,
  getStarred,
  getRecipientsSuggestion,
}
