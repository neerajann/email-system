import dns from 'dns/promises'
import fs from 'fs'
import getTransporterCache from './getTransporterCache.js'

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
  const output = { bounced: [], retriable: [] } // Object to store the output from the delivery operation (contains array of bounced recipients and retriable)

  // Convert recipients into batches grouped by domain name
  const batches =
    failureRecords.length > 0
      ? failureRecords
      : await groupRecipientsByDomain(recipients)

  for (const batch of batches) {
    let { emails, mxCache } = batch
    // Get the domain name from email address
    const domain = emails[0].split('@')[1]

    // If not mx cache, resolve the mx record using dns (MX Cache is avaiable in retry emails)
    if (!mxCache || mxCache.length === 0) {
      mxCache = await resolveMx(domain)
    }

    // If no mx record found, add it to retriable (No mx record could be cause of network or dns issue, so we need to retry again)
    if (mxCache.length === 0) {
      output.retriable.push({ emails, mxCache: [] })
      continue
    }

    // Get transporter for the first mxhost in mxcache (mxcache gets rotated if delivery fails)
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
          process.env.SECURE === 'true' // Only comes in action if SECURE is set to true
            ? {
                domainName: process.env.DOMAIN_NAME,
                keySelector: 'default',
                privateKey: fs.readFileSync('./dkim.private', 'utf8'), // This requires dkim.private key along with public dkim record on dns server
              }
            : undefined,
        inReplyTo: inReplyTo,
        references: references?.join(' '),
      })

      // If some recipients are rejected, they don't exist in receiving server so push to bounced mail
      if (info.rejected?.length)
        output.bounced.push({
          addresses: [...info.rejected],
        })

      const handled = new Set([...info.accepted, ...info.rejected])
      const pending = emails.filter((e) => !handled.has(e))

      // If some are pending, add to retriable
      if (pending.length) {
        output.retriable.push({ emails: pending, mxCache })
      }
    } catch (err) {
      console.log(err)
      // Categorize the error based on reponse code
      const isPermanent = err?.responseCode >= 500

      // If error is permanent then, add the recipients to bounced array
      if (isPermanent) {
        output.bounced.push({
          addresses: [...emails],
          errorMessage: err.response,
        })
      } else {
        // If error is not permanent, rotate the mxrecord and add to retriable (so next retry will use another mxhost)
        const rotated =
          mxCache.length > 1 ? [...mxCache.slice(1), mxCache[0]] : mxCache
        output.retriable.push({ emails, mxCache: rotated })
      }
    }
  }

  return output
}

const groupRecipientsByDomain = async (recipients) => {
  // Group recipients based on domain so that each domain mails can be sent separately
  const groups = Object.groupBy(recipients, (r) => r.split('@')[1])
  const batches = []

  for (const [_, emails] of Object.entries(groups)) {
    batches.push({ emails, mxCache: null })
  }
  return batches
}

const resolveMx = async (domain) => {
  try {
    // Use dns package from node js to resolve mx record
    const mx = await dns.resolveMx(domain)
    if (mx.length) {
      // Sort the mx record based on decreasing priority
      return mx.sort((a, b) => a.priority - b.priority).map((m) => m.exchange)
    }
  } catch (error) {
    console.log(error)
    return []
  }
  // If not mx record exist, try resolving the domain's A record instead
  return await dns.resolve4(domain).catch(() => [])
}

export default smtpRelay
