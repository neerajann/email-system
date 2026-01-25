import mongoose from 'mongoose'
import { Email, Mailbox } from '@email-system/core/models'

const getMails = async ({ userId, label, trash, starred, page = 0 }) => {
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

  const result = await Mailbox.aggregate([
    {
      $match: match,
    },
    {
      $addFields: {
        lastEmailId: { $arrayElemAt: ['$emailIds', -1] },
      },
    },
    {
      $facet: {
        data: [
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
            $sort: {
              'email.receivedAt': -1,
            },
          },
          {
            $project: {
              _id: 0,
              threadId: '$thread._id',
              subject: '$thread.subject',
              messageCount: '$thread.messageCount',
              isRead: '$isRead',
              isStarred: '$isStarred',
              from: '$email.from',
              to: '$email.to',
              snippet: {
                $substrCP: ['$email.body.text', 0, 200],
              },
              isSystem: '$email.isSystem',
              receivedAt: '$email.receivedAt',
              isDeleted: '$isDeleted',
            },
          },

          { $skip: page * 50 },
          { $limit: 50 },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ])
  return {
    mails: result[0].data,
    total: result[0].totalCount[0]?.count || 0,
  }
}

const getMail = async (userId, threadId) => {
  const result = await Mailbox.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        threadId: new mongoose.Types.ObjectId(threadId),
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
        threadId: '$threadId',
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
        isSystem: '$emails.isSystem',
        isStarred: '$isStarred',
        isDeleted: '$isDeleted',
        isRead: '$isRead',
        receivedAt: '$emails.receivedAt',
      },
    },
  ])

  if (result.length === 0) {
    throw new Error('EMAIL_NOT_FOUND')
  }
  return result
}

const searchMail = async ({ query, userId, page = 0, limit = 50 }) => {
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
      $match: {
        'mailbox.userId': new mongoose.Types.ObjectId(userId),
      },
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
        subject: { $first: '$thread.subject' },
        messageCount: { $first: '$thread.messageCount' },
        isRead: { $first: '$mailbox.isRead' },
        labels: { $first: '$mailbox.labels' },
        isStarred: { $first: '$mailbox.isStarred' },
        isDeleted: { $first: '$mailbox.isDeleted' },
        relevanceScore: { $max: '$score' },
        from: { $first: '$from' },
        to: { $first: '$to' },
        body: { $first: '$body.text' },
        isSystem: { $first: '$isSystem' },
        receivedAt: { $first: '$receivedAt' },
      },
    },
    {
      $facet: {
        data: [
          {
            $sort: {
              receivedAt: -1,
            },
          },
          { $skip: page * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              threadId: '$_id',
              subject: '$subject',
              messageCount: '$messageCount',
              isRead: '$isRead',
              isStarred: '$isStarred',
              from: '$from',
              to: '$to',
              body: '$body',
              labels: '$labels',
              isSystem: '$isSystem',
              receivedAt: '$receivedAt',
              isDeleted: '$isDeleted',
              relevanceScore: '$relevanceScore',
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ])

  return {
    mails: result[0].data,
    total: result[0].total[0]?.count || 0,
  }
}
export default { getMails, getMail, searchMail }
