import mongoose from 'mongoose'

const threadSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
    },

    senders: {
      type: Map,
      of: new mongoose.Schema(
        {
          name: String,
          address: String,
        },
        {
          _id: false,
        },
      ),
    },
  },
  { timestamps: true },
)
const Thread = mongoose.model('Thread', threadSchema)
export default Thread
