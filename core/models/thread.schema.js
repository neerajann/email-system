import mongoose from 'mongoose'

const threadSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      index: true,
    },

    messageCount: {
      type: Number,
      default: 1,
    },

    participants: {
      type: [String],
    },
    senders: [
      {
        name: {
          type: String,
        },
        address: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true },
)
const Thread = mongoose.model('Thread', threadSchema)
export default Thread
