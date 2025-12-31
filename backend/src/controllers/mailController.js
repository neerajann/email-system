import mailService from '../services/mailService.js'
import handleMailError from '../utils/handleMailError.js'

const getInbox = async (req, res) => {
  try {
    const emails = await mailService.getMails(req.userId, 'INBOX')
    if (!emails)
      return res.status(200).json({ message: 'No emails at the moment' })
    return res.json(emails)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const getSent = async (req, res) => {
  try {
    const emails = await mailService.getMails(req.userId, 'SENT')
    if (!emails)
      return res
        .status(200)
        .json({ message: "You haven't sent any emails yet" })
    return res.json(emails)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const getTrash = async (req, res) => {
  try {
    const emails = await mailService.getMails(req.userId, 'TRASH')
    if (!emails)
      return res.status(200).json({ message: 'No conversations in Trash.' })
    return res.json(emails)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const sendMail = async (req, res) => {
  try {
    const recipient = req.body?.recipient?.trim()?.toLowerCase()
    const subject = req.body?.subject
    const body = req.body?.body
    if (!recipient)
      return res.status(400).json({ error: 'Recipient is required' })
    await mailService.deliverMail(
      req.userId,
      req.user,
      recipient,
      subject,
      body
    )
    res.status(200).json({ success: 'Mail has been sent.' })
  } catch (error) {
    handleMailError(res, error)
  }
}

const trashMail = async (req, res) => {
  try {
    const mailboxId = req.params.id
    if (!mailboxId) {
      return res.status(401).send({ error: 'Missing id' })
    }
    await mailService.moveToTrash(mailboxId, req.userId)
    return res
      .status(200)
      .json({ success: 'The email has been moved to trash successfully' })
  } catch (error) {
    handleMailError(res, error)
  }
}

const restoreMail = async (req, res) => {
  try {
    const mailboxId = req.params.id
    if (!mailboxId) {
      return res.status(401).send({ error: 'Missing id' })
    }
    await mailService.restoreMail(mailboxId, req.userId)
    return res
      .status(200)
      .json({ success: 'The email has been restored successfully' })
  } catch (error) {
    handleMailError(res, error)
  }
}

const getMail = async (req, res) => {
  try {
    const mail = await mailService.getMail(req.userId, req.mailboxId)
    return res.json(mail)
  } catch (error) {
    handleMailError(res, error)
  }
}

export default {
  getInbox,
  getSent,
  getTrash,
  sendMail,
  trashMail,
  restoreMail,
  getMail,
}
