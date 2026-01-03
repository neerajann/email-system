import sendMailService from '../services/mail/sendMailService.js'
import mailBoxService from '../services/mail/mailBoxService.js'
import fetchMailService from '../services/mail/fetchMailService.js'
import attachmentService from '../services/mail/attachmentService.js'
import handleMailError from '../utils/handleMailError.js'
import upload from '../config/multerConfig.js'
import handleUploadError from '../utils/handleUploadError.js'
import mongoose from 'mongoose'

const getInbox = async (req, res) => {
  try {
    const emails = await fetchMailService.getMails(req.userId, 'INBOX')
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
    const emails = await fetchMailService.getMails(req.userId, 'SENT')
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
    const emails = await fetchMailService.getMails(req.userId, 'TRASH')
    if (!emails)
      return res.status(200).json({ message: 'No conversations in Trash.' })
    return res.json(emails)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const getMail = async (req, res) => {
  try {
    const mail = await fetchMailService.getMail(req.userId, req.mailboxId)
    return res.json(mail)
  } catch (error) {
    handleMailError(res, error)
  }
}

const sendMail = async (req, res) => {
  try {
    var recipients = req.body?.recipients?.toLowerCase()
    recipients = recipients.split(',').map((r) => r.trim())
    const subject = req.body?.subject
    const body = req.body?.body
    const attachments = req.body?.attachments
    if (recipients.length === 0)
      return res.status(400).json({ error: 'Recipient is required' })
    await sendMailService.deliverMail(
      req.userId,
      req.user,
      recipients,
      subject,
      body,
      attachments
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
    await mailBoxService.moveToTrash(mailboxId, req.userId)
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
    await mailBoxService.restoreMail(mailboxId, req.userId)
    return res
      .status(200)
      .json({ success: 'The email has been restored successfully' })
  } catch (error) {
    handleMailError(res, error)
  }
}

const uploadAttachments = async (req, res) => {
  upload.array('attachments', 10)(req, res, async (err) => {
    if (err) return handleUploadError(res, err)
    if (!req.files || req.files.length === 0) {
      return handleUploadError(res, new Error('NO_FILES'))
    }
    const attachmentIds = await attachmentService.addAttachmentsToDB(req.files)
    return res.status(200).json(attachmentIds)
  })
}
const downloadAttachment = async (req, res) => {
  const attachmentId = req.params?.id
  const mailId = req.query?.mailId?.trim()
  if (!attachmentId || !mailId) {
    return res.status(404).json({ error: 'Not found' })
  }
  if (!mongoose.Types.ObjectId.isValid(mailId)) {
    return res.status(404).json({ error: 'Not found' })
  }
  const attachment = await attachmentService.fetchAttachmentRecord({
    userId: req.userId,
    mailId,
    attachmentId,
  })
  if (!attachment) {
    return res.status(404).json({ error: 'Not found' })
  }
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${attachment.originalName}`
  )

  res.sendFile(attachment.path)
}

export default {
  getInbox,
  getSent,
  getTrash,
  sendMail,
  trashMail,
  restoreMail,
  getMail,
  uploadAttachments,
  downloadAttachment,
}
