import mongoose from 'mongoose'
import { Email, Mailbox } from '@email-system/core/models'

const getMails = async ({
  userId,
  label,
  trash,
  starred,
  cursorDate,
  cursorId,
  limit = 20,
}) => {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
  }

  if (label) {
    match.labels = { $in: [label] }
  }
  if (trash === true) {
    match.isDeleted = true
  }
  if (starred === true) {
    match.isStarred = true
  }
  if (cursorDate && cursorId) {
    match.$or = [
      {
        lastMessageAt: { $lt: cursorDate },
      },
      {
        lastMessageAt: { $lt: cursorDate },
        _id: { $lt: cursorId },
      },
    ]
  }

  const mails = await Mailbox.aggregate([
    {
      $match: match,
    },
    {
      $sort: {
        lastMessageAt: -1,
        _id: -1,
      },
    },
    { $limit: limit + 1 },
    {
      $addFields: {
        lastEmailId: { $arrayElemAt: ['$emailIds', -1] },
      },
    },
    {
      $lookup: {
        from: 'emails',
        localField: 'lastEmailId',
        foreignField: '_id',
        as: 'email',
      },
    },
    { $unwind: '$email' },
    {
      $lookup: {
        from: 'threads',
        localField: 'threadId',
        foreignField: '_id',
        as: 'thread',
      },
    },
    { $unwind: '$thread' },
    {
      $project: {
        _id: 0,
        mailboxId: '$_id',
        subject: '$thread.subject',
        messageCount: '$thread.messageCount',
        isRead: 1,
        isStarred: 1,
        from: '$thread.senders',
        snippet: {
          $substrCP: ['$email.body.text', 0, 200],
        },
        isSystem: '$email.isSystem',
        receivedAt: '$email.receivedAt',
        isDeleted: 1,
      },
    },
  ])
  const hasMore = mails.length > limit
  const sliced = hasMore ? mails.slice(0, limit) : mails

  const last = sliced[sliced.length - 1]

  return {
    mails: sliced,
    nextCursor: hasMore
      ? `${last.mailboxId}_${last.receivedAt.toISOString()}`
      : null,
  }
}

const getMail = async (userId, id) => {
  const result = await Mailbox.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'emails',
        localField: 'emailIds',
        foreignField: '_id',
        as: 'emails',
      },
    },
    {
      $unwind: '$emails',
    },
    { $sort: { 'emails.receivedAt': 1 } },
    {
      $lookup: {
        from: 'attachments',
        localField: 'emails.attachments',
        foreignField: '_id',
        as: 'attachments',
      },
    },
    {
      $project: {
        _id: 0,
        emailId: '$emails._id',
        mailboxId: '$_id',
        from: '$emails.from',
        to: '$emails.to',
        subject: '$emails.subject',
        body: '$emails.body',
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              id: '$$attachment._id',
              fileName: '$$attachment.originalName',
            },
          },
        },
        inReplyTo: '$emails.inReplyTo',
        isSystem: '$emails.isSystem',
        isStarred: '$isStarred',
        isDeleted: '$isDeleted',
        isRead: '$isRead',
        receivedAt: '$emails.receivedAt',
        messageId: '$emails.messageId',
      },
    },
  ])

  if (result.length === 0) {
    throw new Error('EMAIL_NOT_FOUND')
  }
  return {
    mails: result,
  }
}

const searchMail = async ({ query, userId, cursor, limit = 20 }) => {
  const mailboxMatch = {
    'mailbox.userId': new mongoose.Types.ObjectId(userId),
  }

  if (cursor) {
    const [mailboxId, receivedAt] = cursor.split('_')
    mailboxMatch.$or = [
      { 'mailbox.lastMessageAt': { $lt: new Date(receivedAt) } },
      {
        'mailbox.lastMessageAt': new Date(receivedAt),
        'mailbox._id': { $lt: new mongoose.Types.ObjectId(mailboxId) },
      },
    ]
  }

  const result = await Email.aggregate([
    {
      $match: {
        $text: {
          $search: query,
        },
      },
    },
    {
      $addFields: {
        score: { $meta: 'textScore' },
      },
    },
    {
      $lookup: {
        from: 'mailboxes',
        localField: '_id',
        foreignField: 'emailIds',
        as: 'mailbox',
      },
    },
    { $unwind: '$mailbox' },
    {
      $match: mailboxMatch,
    },
    {
      $lookup: {
        from: 'threads',
        localField: 'mailbox.threadId',
        foreignField: '_id',
        as: 'thread',
      },
    },
    { $unwind: '$thread' },
    { $sort: { score: -1 } },
    {
      $group: {
        _id: '$thread._id',
        mailboxId: { $first: '$mailbox._id' },
        subject: { $first: '$thread.subject' },
        messageCount: { $first: '$thread.messageCount' },
        isRead: { $first: '$mailbox.isRead' },
        labels: { $first: '$mailbox.labels' },
        isStarred: { $first: '$mailbox.isStarred' },
        isDeleted: { $first: '$mailbox.isDeleted' },
        relevanceScore: { $max: '$score' },
        from: { $first: '$thread.senders' },
        body: { $first: '$body.text' },
        isSystem: { $first: '$isSystem' },
        receivedAt: { $first: '$mailbox.lastMessageAt' },
      },
    },
    {
      $sort: {
        receivedAt: -1,
        mailboxId: -1,
      },
    },
    { $limit: limit + 1 },
    {
      $project: {
        _id: 0,
        mailboxId: 1,
        subject: 1,
        messageCount: 1,
        isRead: 1,
        isStarred: 1,
        from: 1,
        body: 1,
        labels: 1,
        isSystem: 1,
        receivedAt: 1,
        isDeleted: 1,
        relevanceScore: 1,
      },
    },
  ])

  const hasMore = result.length > limit
  const sliced = hasMore ? result.slice(0, limit) : result
  const last = sliced[sliced.length - 1]

  return {
    mails: sliced,
    cursor: last ? `${last.mailboxId}_${last.receivedAt.toISOString()}` : null,
  }
}
export default { getMails, getMail, searchMail }
