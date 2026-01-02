import mongoose from 'mongoose'

const threadSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      index: true,
    },

    participants: [
      {
        type: String,
        index: true,
      },
    ],

    lastMessageAt: {
      type: Date,
      index: true,
    },

    messageCount: {
      type: Number,
      default: 1,
    },

    messageIds: {
      type: [String],
      index: true,
    },
  },
  { timestamps: true }
)
const Thread = mongoose.model('Thread', threadSchema)
export default Thread
