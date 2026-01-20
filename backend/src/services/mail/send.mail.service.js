import { htmlToText } from 'html-to-text'
import crypto from 'crypto'
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import {
  Thread,
  Mailbox,
  Email,
  Attachment,
  User,
} from '@email-system/core/models'
import { outboundEmailQueue } from '@email-system/core/queues'

const deliverMail = async ({
  senderId,
  senderAddress,
  recipients,
  subject,
  body,
  attachments,
}) => {
  const textContent = htmlToText(body, {
    wordwrap: 80,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' },
    ],
  })
  const htmlContent = sanitizeHtml(body, SANITIZE_CONFIG)

  const messageId = `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  try {
    var userInfo = await User.findOne(
      {
        emailAddress: senderAddress,
        _id: senderId,
      },
      {
        firstName: 1,
        emailAddress: 1,
      },
    )

    if (!userInfo) throw new Error('USER_NOT_FOUND')

    const parsedAttachments = attachments?.map(
      (id) => new mongoose.Types.ObjectId(id),
    )

    if (attachments?.length) {
      var count = await Attachment.countDocuments({
        _id: {
          $in: parsedAttachments,
        },
      })
    }

    if (attachments?.length && parsedAttachments.length !== count) {
      throw new Error('INVALID_ATTACHMENTS')
    }

    var thread = await Thread.create({
      subject: subject,
      participants: Array.from(new Set([senderAddress, ...recipients])),
      messageIds: [messageId],
      lastMessageAt: new Date(),
    })

    var email = await Email.create({
      threadId: thread._id,
      from: {
        address: senderAddress,
        name: userInfo.firstName,
      },
      to: recipients.map((r) => ({
        address: r,
      })),
      messageId: messageId,
      subject,
      body: {
        text: textContent,
        html: htmlContent,
      },
      attachments: parsedAttachments,
    })

    await Mailbox.create([
      {
        userId: senderId,
        threadId: thread._id,
        emailId: email._id,
        labels: ['SENT'],
        isRead: true,
      },
    ])
  } catch (error) {
    if (error.message === 'INVALID_ATTACHMENTS') throw error
    if (error.message === 'USER_NOT_FOUND') throw error
    console.log(error)
    throw new Error('DATABASE_ERROR')
  }

  await outboundEmailQueue.add(
    'outboundEmailQueue',
    {
      emailId: email._id,
      threadId: thread._id,
      sender: {
        address: senderAddress,
        name: userInfo.firstName,
        id: senderId,
      },
      recipients: recipients,
      subject,
      body: {
        html: htmlContent,
        text: textContent,
      },
      attachments,
      messageId: messageId,
    },
    {
      attempts: 1,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: {
        age: 3600,
      },
      removeOnFail: {
        age: 24 * 3600,
      },
    },
  )
  return true
}

const SANITIZE_CONFIG = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'b',
    'strong',
    'i',
    'em',
    'ul',
    'ol',
    'li',
    'br',
    'span',
    'div',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'img',
    'a',
  ],

  allowedAttributes: {
    a: ['href', 'target'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['style'],
  },

  allowedSchemes: ['http', 'https', 'mailto', 'cid'],

  allowedStyles: {
    '*': {
      color: [/^#[0-9a-fA-F]{3,6}$/],
      'background-color': [/^#[0-9a-fA-F]{3,6}$/],
      'font-size': [/^\d+(px|em|%)$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'text-align': [/^(left|right|center|justify)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
    },
  },
}

export default { deliverMail }
