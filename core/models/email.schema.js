import mongoose from 'mongoose'

const emailSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
      index: true,
      required: true,
    },
    messageId: {
      type: String,
      index: true,
      sparse: true,
      unique: true,
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
      text: {
        type: String,
        default: ' ',
      },
      html: {
        type: String,
        default: '',
      },
    },
    attachments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Attachment',
          required: true,
        },
      ],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    bounceFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Email',
    },
  },

  { timestamps: true }
)
emailSchema.index({ _id: 1, attachments: 1 })

const Email = mongoose.model('Email', emailSchema)
export default Email
