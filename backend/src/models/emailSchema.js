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
    attachments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Attachment',
          required: true,
        },
      ],
    },
    default: [],
  },
  { timestamps: true }
)

const Email = mongoose.model('Email', emailSchema)
export default Email
