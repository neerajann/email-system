import sendMailService from '../services/mail/send.mail.service.js'
import mailBoxService from '../services/mail/mailbox.service.js'
import fetchMailService from '../services/mail/fetch.mail.service.js'
import handleMailError from '../utils/handleMailError.js'

const getInbox = async (req, reply) => {
  try {
    const emails = await fetchMailService.getMails({
      userId: req.userId,
      label: 'INBOX',
    })
    if (!emails)
      return reply.code(200).send({ message: 'No emails at the moment' })
    return reply.send(emails)
  } catch (error) {
    console.log(error)
    reply.code(500).send({ error: 'Something went wrong' })
  }
}

const getSent = async (req, reply) => {
  try {
    const emails = await fetchMailService.getMails({
      userId: req.userId,
      label: 'SENT',
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
    const emails = await fetchMailService.getMails({
      userId: req.userId,
      trash: true,
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
    const emails = await fetchMailService.getMails({
      userId: req.userId,
      starred: true,
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
    const threadId = req.body?.threadId
    await sendMailService.deliverMail({
      senderId: req.userId,
      senderAddress: req.user,
      recipients,
      subject,
      body,
      attachments,
      emailId,
      threadId,
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
    const emails = await fetchMailService.searchMail({
      query,
      user: req.user,
      userId: req.userId,
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
    const threadId = req.params.id
    await mailBoxService.patchMail({
      threadId,
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
    const threadId = req.params.id
    await mailBoxService.deleteMail({ userId: req.userId, threadId })
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
