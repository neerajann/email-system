import sendMailService from '../services/mail/send.mail.service.js'
import mailBoxService from '../services/mail/mailbox.service.js'
import fetchMailService from '../services/mail/fetch.mail.service.js'
import handleMailError from '../utils/handleMailError.js'
import mongoose from 'mongoose'

const getInbox = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : []
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])
    const emails = await fetchMailService.getMails({
      userId: req.userId,
      label: 'INBOX',
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate,
    })

    if (!emails)
      return reply.code(200).send({ message: 'No emails at the moment' })
    console.log({ emails })

    return reply.send(emails)
  } catch (error) {
    console.log(error)
    reply.code(500).send({ error: 'Something went wrong' })
  }
}

const getSent = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : []
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])

    const emails = await fetchMailService.getMails({
      userId: req.userId,
      label: 'SENT',
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate,
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

const getTrash = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : []
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])

    const emails = await fetchMailService.getMails({
      userId: req.userId,
      trash: true,
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate,
    })

    if (!emails)
      return reply.code(200).send({ message: 'No conversations in Trash.' })
    return reply.send(emails)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
  }
}

const getStarred = async (req, reply) => {
  try {
    const cursor = req.query?.cursor ? req.query.cursor.split('_') : []
    const cursorId = mongoose.isValidObjectId(cursor[0])
      ? new mongoose.Types.ObjectId(cursor[0])
      : null
    const cursorDate = new Date(cursor[1])

    const emails = await fetchMailService.getMails({
      userId: req.userId,
      starred: true,
      cursorId,
      cursorDate: isNaN(cursorDate.getTime()) ? null : cursorDate,
    })

    if (!emails)
      return reply.code(200).send({ message: 'No conversations in Starred.' })
    return reply.send(emails)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
  }
}

const getMail = async (req, reply) => {
  try {
    const mail = await fetchMailService.getMail(req.userId, req.mailboxId)
    return reply.send(mail)
  } catch (error) {
    handleMailError(reply, error)
  }
}

const sendMail = async (req, reply) => {
  try {
    const recipients = req.body.recipients.map((recipient) => {
      return recipient.toLowerCase()
    })

    const subject = req.body?.subject
    const body = req.body?.body
    const attachments = req.body?.attachments
    const emailId = req.body?.emailId
    const mailboxId = req.body?.mailboxId
    await sendMailService.deliverMail({
      senderId: req.userId,
      senderAddress: req.user,
      recipients,
      subject,
      body,
      attachments,
      emailId,
      mailboxId,
    })
    reply.code(200).send({ success: 'Mail has been sent.' })
  } catch (error) {
    handleMailError(reply, error)
  }
}
const searchMail = async (req, reply) => {
  try {
    const query = req.query?.q
    if (!query)
      return reply.code(400).send({ error: 'Missing query parameter' })

    const cursor = req.query?.cursor ? req.query.cursor.split('_') : []
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

const patchMail = async (req, reply) => {
  try {
    const mailboxIds = req.body.mailboxIds
    await mailBoxService.patchMail({
      mailboxIds,
      userId: req.userId,
      data: req.body,
    })
    return reply.code(200).send({
      success: 'The operation was successful.',
    })
  } catch (error) {
    handleMailError(reply, error)
  }
}

const deleteMail = async (req, reply) => {
  try {
    const mailboxId = req.params.id
    await mailBoxService.deleteMail({ userId: req.userId, mailboxId })
    return reply.code(200).send({
      success: 'The mail has been deleted successfully.',
    })
  } catch (error) {
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
}
