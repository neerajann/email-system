import mailService from '../services/mailService.js'
import handleMailError from '../utils/handleMailError.js'

const getInbox = async (req, res) => {
  try {
    const emails = await mailService.getMailService(req.userId, 'INBOX')
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
    const emails = await mailService.getMailService(req.userId, 'SENT')
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
    const emails = await mailService.getMailService(req.userId, 'TRASH')
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

export default { getInbox, getSent, getTrash, sendMail }
