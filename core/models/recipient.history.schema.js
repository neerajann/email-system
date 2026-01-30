import mongoose from 'mongoose'

const recipientHistorySchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    emailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    sentCount: {
      type: Number,
      default: 0,
    },
    receivedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

recipientHistorySchema.index(
  { ownerUserId: 1, emailAddress: 1 },
  { unique: true },
)

const RecipientHistory = mongoose.model(
  'RecipientHistory',
  recipientHistorySchema,
)
export default RecipientHistory
