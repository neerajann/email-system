import mongoose from 'mongoose'
import { RecipientHistory } from '@email-system/core/models'

const suggestRecipients = async ({ userId, query, limit = 5 }) => {
  const ownerObjectId = new mongoose.Types.ObjectId(userId)
  const result = await RecipientHistory.aggregate([
    {
      $match: {
        ownerUserId: ownerObjectId,
        emailAddress: { $regex: `^${query}`, $options: 'i' },
      },
    },
    {
      $addFields: {
        score: {
          $add: [{ $multiply: ['$sentCount', 3] }, '$receivedCount'],
        },
      },
    },
    { $sort: { score: -1 } },
    {
      $project: {
        _id: 0,
        id: '$_id',
        emailAddress: 1,
      },
    },
    { $limit: limit },
  ])

  return result
}

export default { suggestRecipients }
