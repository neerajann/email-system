import sendMailService from '../services/mail/send.mail.service.js'
import mailBoxService from '../services/mail/mailbox.service.js'
import fetchMailService from '../services/mail/fetch.mail.service.js'
import handleMailError from '../utils/handleMailError.js'

const getInbox = async (req, reply) => {
  try {
    const emails = await fetchMailService.getMails(req.userId, 'INBOX')
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
    const emails = await fetchMailService.getMails(req.userId, 'SENT')
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

    await sendMailService.deliverMail({
      senderId: req.userId,
      sender: req.user,
      recipients,
      subject,
      body,
      attachments,
    })
    reply.code(200).send({ success: 'Mail has been sent.' })
  } catch (error) {
    handleMailError(reply, error)
  }
}

const getTrash = async (req, reply) => {
  try {
    const emails = await fetchMailService.getMails(req.userId, 'TRASH')
    if (!emails)
      return reply.code(200).send({ message: 'No conversations in Trash.' })
    return reply.send(emails)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
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
  } catch {
    handleMailError(reply, error)
  }
}
const getStarred = async (req, reply) => {
  try {
    const emails = fetchMailService.getStarred(req.userId)
  } catch (error) {}
}

export default {
  getInbox,
  getSent,
  getTrash,
  sendMail,
  getMail,
  patchMail,
  deleteMail,
  getStarred,
}
