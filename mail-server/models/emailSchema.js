import mongoose from 'mongoose'

const emailSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
      index: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: [
      {
        type: String,
        required: true,
      },
    ],
    subject: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      required: true,
    },
    attachments: [
      {
        fileName: {
          type: String,
        },
        url: {
          type: String,
        },
        size: {
          type: Number,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

const Email = mongoose.model('Email', emailSchema)
export default Email
