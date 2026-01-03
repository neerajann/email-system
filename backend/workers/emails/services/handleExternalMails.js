import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'

const transporter = nodemailer.createTransport(
  directTransport({
    name: process.env.DOMAIN_NAME,
    debug: true,

    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  })
)

const handleExternalMails = async ({
  messageId,
  sender,
  recipients,
  subject,
  body,
  attachmentsRecords,
}) => {
  try {
    const info = await transporter.sendMail({
      from: sender,
      to: recipients,
      messageId: messageId,
      subject: subject,
      text: body.text,
      html: body.html,
      attachments: attachmentsRecords?.map((record) => ({
        filename: record.originalName,
        encoding: record.encoding,
        path: record.path,
      })),
    })
    console.log(info)
    return normalizeInfo(info)
  } catch (err) {
    console.log('Nodemailer Error:', err)
    var classification = classifyTransportError(err.errors[0])
  }
  return {
    accepted: [],
    rejected: classification.type === 'PERMANENT' ? recipients : [],
    pending: classification.type === 'TEMPORARY' ? recipients : [],
    error: classification,
  }
}

function classifyTransportError(err) {
  if (
    err.code === 'ENOTFOUND' ||
    err.code === 'ETIMEDOUT' ||
    err.code === 'ECONNREFUSED' ||
    err.code === 'EHOSTUNREACH'
  ) {
    return { type: 'TEMPORARY', reason: err.message }
  }

  if (err.responseCode && err.responseCode >= 500) {
    return { type: 'PERMANENT', reason: err.message }
  }

  return { type: 'TEMPORARY', reason: err.message }
}

const normalizeInfo = (info) => {
  return {
    accepted: Array.isArray(info.accepted) ? info.accepted : [],
    rejected: Array.isArray(info.rejected) ? info.rejected : [],
    pending: Array.isArray(info.pending)
      ? info.pending.flatMap((p) => p.recipients || [])
      : [],
  }
}
export default handleExternalMails
