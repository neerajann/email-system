import nodemailer from 'nodemailer'
import dns from 'dns/promises'
import fs from 'fs'
const smtpRelay = async ({
  sender,
  recipients,
  headerTo,
  failureRecords = [],
  subject,
  body,
  messageId,
  attachmentsRecords,
  inReplyTo,
  references,
}) => {
  const output = { bounced: [], retriable: [] }

  const batches =
    failureRecords.length > 0
      ? failureRecords
      : await groupRecipientsByDomain(recipients)

  for (const batch of batches) {
    let { emails, mxCache } = batch
    const domain = emails[0].split('@')[1]

    if (!mxCache || mxCache.length === 0) {
      mxCache = await resolveMx(domain)
    }

    if (mxCache.length === 0) {
      output.retriable.push({ emails, mxCache: [] })
      continue
    }

    const currentHost = mxCache[0]
    const transporter = nodemailer.createTransport({
      host: currentHost,
      port: 25,
      connectionTimeout: 5000,
      tls: { rejectUnauthorized: false },
    })

    try {
      const info = await transporter.sendMail({
        from: {
          name: sender.name,
          address: sender.address,
        },
        to: headerTo,
        envelope: { from: sender, to: emails },
        subject,
        messageId,
        text: body?.text,
        html: body?.html,
        attachments: attachmentsRecords?.map((r) => ({
          filename: r.originalName,
          path: r.path,
        })),
        dkim: {
          domainName: process.env.DOMAIN_NAME,
          keySelector: 'default',
          privateKey: fs.readFileSync('./inboxify.private', 'utf8'),
        },
        inReplyTo: inReplyTo,
        references: references?.join(' '),
      })

      if (info.rejected?.length) output.bounced.push(...info.rejected)

      const handled = new Set([...info.accepted, ...info.rejected])
      const pending = emails.filter((e) => !handled.has(e))

      if (pending.length) {
        output.retriable.push({ emails: pending, mxCache })
      }
    } catch (err) {
      const isPermanent = err?.responseCode >= 500

      if (isPermanent) {
        output.bounced.push(...emails)
      } else {
        const rotated =
          mxCache.length > 1 ? [...mxCache.slice(1), mxCache[0]] : mxCache
        output.retriable.push({ emails, mxCache: rotated })
      }
    }
  }

  return output
}

const groupRecipientsByDomain = async (recipients) => {
  const groups = Object.groupBy(recipients, (r) => r.split('@')[1])
  const batches = []

  for (const [_, emails] of Object.entries(groups)) {
    batches.push({ emails, mxCache: null })
  }
  return batches
}

const resolveMx = async (domain) => {
  try {
    const mx = await dns.resolveMx(domain)
    if (mx.length) {
      return mx.sort((a, b) => a.priority - b.priority).map((m) => m.exchange)
    }
  } catch {}
  return await dns.resolve4(domain).catch(() => [])
}
export default smtpRelay
