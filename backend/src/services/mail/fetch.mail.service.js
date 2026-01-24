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
      $sort: {
        receivedAt: -1,
      },
    },
    {
      $group: {
        _id: '$threadId',
        emailId: { $first: '$emailId' },
        isRead: { $first: '$isRead' },
        isStarred: { $first: '$isStarred' },
        receivedAt: { $first: '$receivedAt' },
        isDeleted: { $first: '$isDeleted' },
      },
    },
    {
      $facet: {
        data: [
          {
            $lookup: {
              from: 'emails',
              localField: 'emailId',
              foreignField: '_id',
              as: 'emails',
            },
          },
          {
            $unwind: '$emails',
          },
          {
            $lookup: {
              from: 'threads',
              localField: '_id',
              foreignField: '_id',
              as: 'threads',
            },
          },
          { $unwind: '$threads' },
          {
            $sort: {
              receivedAt: -1,
            },
          },
          {
            $project: {
              _id: 0,
              threadId: '$_id',
              subject: '$threads.subject',
              messageCount: '$threads.messageCount',
              isRead: 1,
              isStarred: 1,
              from: '$emails.from',
              to: '$emails.to',
              snippet: {
                $substrCP: ['$emails.body.text', 0, 200],
              },
              isSystem: '$emails.isSystem',
              receivedAt: 1,
              isDeleted: 1,
            },
          },

          { $skip: page * 50 },
          { $limit: 50 },
        ],
        totalCount: [{ $count: 'count' }],
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
    { $sort: { receivedAt: 1 } },
    {
      $lookup: {
        from: 'emails',
        localField: 'emailId',
        foreignField: '_id',
        as: 'emails',
      },
    },
    {
      $unwind: '$emails',
    },
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
        receivedAt: '$receivedAt',
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
        foreignField: 'emailId',
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
        as: 'threads',
      },
    },
    { $unwind: '$threads' },

    {
      $group: {
        _id: '$mailbox.threadId',
        emailId: { $first: '$_id' },
        isRead: { $first: '$mailbox.isRead' },
        isStarred: { $first: '$mailbox.isStarred' },
        receivedAt: { $first: '$mailbox.receivedAt' },
        isDeleted: { $first: '$mailbox.isDeleted' },
        labels: { $first: '$mailbox.labels' },
        relevanceScore: { $max: '$score' },
      },
    },

    {
      $facet: {
        data: [
          // Sort by relevance score first, then by date
          { $sort: { relevanceScore: -1, receivedAt: -1 } },
          { $skip: page * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'emails',
              localField: 'emailId',
              foreignField: '_id',
              as: 'emails',
            },
          },
          { $unwind: '$emails' },
          {
            $lookup: {
              from: 'threads',
              localField: '_id',
              foreignField: '_id',
              as: 'threads',
            },
          },
          { $unwind: '$threads' },
          {
            $project: {
              _id: 0,
              threadId: '$_id',
              subject: '$threads.subject',
              messageCount: '$threads.messageCount',
              isRead: 1,
              isStarred: 1,
              from: '$emails.from',
              to: '$emails.to',
              body: '$emails.body.text',
              labels: 1,
              isSystem: '$emails.isSystem',
              receivedAt: 1,
              isDeleted: 1,
              relevanceScore: 1,
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
