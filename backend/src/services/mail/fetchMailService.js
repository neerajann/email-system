import mongoose from 'mongoose'
import Mailbox from '../../models/mailboxSchema.js'

const getMails = async (userId, label) => {
  let page = 0
  const result = await Mailbox.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        labels: { $in: [label] },
        isDeleted: label === 'TRASH',
      },
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
        receivedAt: { $first: '$receivedAt' },
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
            $project: {
              subject: '$threads.subject',
              messageCount: '$threads.messageCount',
              isRead: 1,
              from: '$emails.from',
              to: '$emails.to',
              snippet: {
                $substrCP: ['$emails.body', 0, 100],
              },
              isSystem: '$emails.isSystem',
              receivedAt: 1,
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
  Mailbox.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      threadId: new mongoose.Types.ObjectId(threadId),
    },
    {
      $set: {
        isRead: true,
      },
    }
  )
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
      $project: {
        _id: 0,
        id: '$_id',
        threadId: '$threadId',
        from: '$emails.from',
        to: '$emails.to',
        subject: '$emails.subject',
        body: '$emails.body',
        attachments: '$emails.attachments',
        isSystem: '$emails.isSystem',
        receivedAt: '$receivedAt',
      },
    },
  ])
  if (result.length === 0) {
    throw new Error('EMAIL_NOT_FOUND')
  }
  return result
}

export default { getMails, getMail }
