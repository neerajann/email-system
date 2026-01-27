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
import notifyUser from '@email-system/core/messaging'

const deliverMail = async ({
  senderId,
  senderAddress,
  recipients,
  subject,
  body,
  attachments,
  emailId,
  threadId,
}) => {
  let thread = null
  const bodyText = htmlToText(body, {
    wordwrap: 80,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' },
    ],
  })
  const bodyHtml = sanitizeHtml(body, SANITIZE_CONFIG)

  const messageId = `<${crypto.randomUUID()}@${process.env.DOMAIN_NAME}>`

  try {
    //Additional checks to make sure that the user exists( infuture it could be like if user has enough storage or not as well)
    var userInfo = await User.findOne(
      {
        emailAddress: senderAddress,
        _id: senderId,
      },
      {
        name: 1,
        emailAddress: 1,
      },
    )

    if (!userInfo) throw new Error('USER_NOT_FOUND')

    //convert attachment id's into mongoose object id and filter invalid ones
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

    // check if thread exists
    if (threadId) {
      thread = await Thread.findById(threadId)
      console.log({ thread })
    }
    if (!thread) {
      // create a new thread if it doesnot exist
      thread = await createThread({ subject, senderAddress, recipients })
    } else {
      // check if all the participants are same as that of the thread
      const nextParticipants = new Set([senderAddress, ...recipients])
      const prevParticipants = new Set([...thread.participants])
      const hasNewParticipants = [...nextParticipants].some(
        (p) => !prevParticipants.has(p),
      )
      console.log({ nextParticipants })
      console.log({ prevParticipants })

      //If not create a new thread
      if (hasNewParticipants) {
        thread = await createThread({ subject, senderAddress, recipients })
      }
    }

    if (emailId) {
      //find older email id
      const olderMail = await Email.findById(emailId)
      if (olderMail) {
        //check if user actually owns the mail that they are trying to reply to
        const emailExistInUserMailbox = await Mailbox.findOne({
          emailId: olderMail._id,
          userId: senderId,
        })
        if (!emailExistInUserMailbox) {
          throw new Error('UNAUTHORIZED_REPLY')
        } else {
          //creates a new reply email using the older mail message id
          var email = await createEmail({
            threadId: thread._id,
            senderAddress,
            senderName: userInfo.name,
            recipients,
            messageId,
            subject: `Re: ${thread.subject}`,
            bodyHtml,
            bodyText,
            attachments: parsedAttachments,
            inReplyTo: olderMail.inReplyTo,
            references: [...olderMail.references, olderMail.messageId],
          })
        }
      } else {
        //if oldermail not found create a new email one not reply
        var email = await createEmail({
          threadId: thread._id,
          senderAddress,
          senderName: userInfo.name,
          recipients,
          messageId,
          subject: thread.subject,
          bodyHtml,
          bodyText,
          attachments: parsedAttachments,
        })
      }
    } else {
      //normal case when emailId is not present
      var email = await createEmail({
        threadId: thread._id,
        senderAddress,
        senderName: userInfo.name,
        recipients,
        messageId,
        subject: thread.subject,
        bodyHtml,
        bodyText,
        attachments: parsedAttachments,
      })
    }
    //update message count if it was valid reply mail
    if (thread._id.equals(threadId)) {
      await Thread.findByIdAndUpdate(threadId, {
        $inc: {
          messageCount: 1,
        },
      })
    }
    console.log({ recipients })

    var senderInRecipent = recipients.includes(senderAddress)
    const labels = senderInRecipent ? ['SENT', 'INBOX'] : ['SENT']

    await Mailbox.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(senderId),
        threadId: thread._id,
      },
      {
        $set: {
          isRead: !senderInRecipent,
          lastMessageAt: Date.now(),
        },
        $addToSet: {
          labels: { $each: labels },
        },
        $push: {
          emailIds: email._id,
        },
      },
      {
        upsert: true,
      },
    )

    var envelopeTo = recipients.filter((r) => r != senderAddress)
    // update mailbox or creates a new one
  } catch (error) {
    if (error.message === 'INVALID_ATTACHMENTS') throw error
    if (error.message === 'USER_NOT_FOUND') throw error
    if (error.message === 'UNAUTHORIZED_REPLY') throw error
    console.log(error)
    throw new Error('DATABASE_ERROR')
  }

  if (senderInRecipent) {
    const notifications = [
      {
        userId: senderId,
        newMail: {
          threadId: email.threadId,
          from: email.from,
          to: email.to,
          subject: email.subject,
          snippet: email.body?.text?.substring(0, 200) ?? ' ',
          isSystem: false,
          messageCount: thread.messageCount,
          isRead: false,
          isStarred: false,
          receivedAt: email.receivedAt,
          isDeleted: false,
        },
      },
    ]
    notifyUser(notifications)
  }

  if (envelopeTo.length < 0) return true
  // add to mail delivery queue
  await outboundEmailQueue.add(
    'outboundEmailQueue',
    {
      emailId: email._id,
      threadId: thread._id,
      sender: {
        address: senderAddress,
        name: userInfo.name,
        id: senderId,
      },
      recipients: envelopeTo,
      headerTo: recipients,
      subject,
      body: {
        html: bodyHtml,
        text: bodyText,
      },
      attachments,
      messageId: messageId,
      inReplyTo: email?.inReplyTo,
      references: email?.references,
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

const createThread = async ({ subject, senderAddress, recipients }) => {
  return await Thread.create({
    subject: subject,
    participants: Array.from(new Set([senderAddress, ...recipients])),
    lastMessageAt: new Date(),
  })
}

const createEmail = async ({
  threadId,
  senderAddress,
  senderName,
  recipients,
  messageId,
  subject,
  bodyText,
  bodyHtml,
  attachments,
  inReplyTo,
  references,
}) => {
  const email = {
    threadId: threadId,
    from: {
      address: senderAddress,
      name: senderName,
    },
    to: recipients.map((r) => ({
      address: r,
    })),
    messageId: messageId,
    subject: subject,
    body: {
      text: bodyText,
      html: bodyHtml,
    },
    attachments: attachments,
  }
  if (inReplyTo) {
    email.inReplyTo = inReplyTo
  }
  if (references) {
    email.references = references
  }
  return await Email.create(email)
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
