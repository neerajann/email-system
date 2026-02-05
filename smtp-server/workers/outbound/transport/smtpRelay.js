import nodemailer from 'nodemailer'
import dns from 'dns/promises'
import fs from 'fs'
import getTransporterCache from './getTransporterCache'

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

    const transporter = getTransporterCache({ mxHost: mxCache[0] })

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
        dkim:
          process.env.SECURE === 'true'
            ? {
                domainName: process.env.DOMAIN_NAME,
                keySelector: 'default',
                privateKey: fs.readFileSync('./dkim.private', 'utf8'),
              }
            : undefined,
        inReplyTo: inReplyTo,
        references: references?.join(' '),
      })

      if (info.rejected?.length)
        output.bounced.push({
          addresses: [...info.rejected],
        })

      const handled = new Set([...info.accepted, ...info.rejected])
      const pending = emails.filter((e) => !handled.has(e))

      if (pending.length) {
        output.retriable.push({ emails: pending, mxCache })
      }
    } catch (err) {
      console.log(err)
      const isPermanent = err?.responseCode >= 500

      if (isPermanent) {
        output.bounced.push({
          addresses: [...emails],
          errorMessage: err.message,
        })
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
    console.log(mx)

    if (mx.length) {
      return mx.sort((a, b) => a.priority - b.priority).map((m) => m.exchange)
    }
  } catch (error) {
    console.log(error)
  }
  return await dns.resolve4(domain).catch(() => [])
}
export default smtpRelay
