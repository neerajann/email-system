import mongoose from 'mongoose'

const threadSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: String,
      },
    ],
    subject: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)
const Thread = mongoose.model('threads', threadSchema)
export default Thread
