import mongoose from 'mongoose'
import { RecipientHistory } from '@email-system/core/models'

const suggestRecipients = async ({ userId, query, limit = 5 }) => {
  const ownerObjectId = new mongoose.Types.ObjectId(userId)
  const result = await RecipientHistory.aggregate([
    {
      $match: {
        ownerUserId: ownerObjectId,
        emailAddress: { $regex: `^${query}`, $options: 'i' }, // Find email address based on regex matching
      },
    },
    {
      $addFields: {
        score: {
          $add: [{ $multiply: ['$sentCount', 3] }, '$receivedCount'], // Add a new field to  find the most relevant suggestion(sentCount carries more weight so it was multiplied by 3)
        },
      },
    },
    { $sort: { score: -1 } }, // Sort based on score
    {
      $project: {
        _id: 0,
        id: '$_id',
        emailAddress: 1,
      },
    },
    { $limit: limit }, // Limit to 5 suggestions only
  ])

  return result
}

export default { suggestRecipients }
