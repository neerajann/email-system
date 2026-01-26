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
      address: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
    },
    to: [
      {
        address: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        },
        _id: false,
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
    inReplyTo: {
      type: String,
    },
    references: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },

  { timestamps: true },
)
emailSchema.index({ _id: 1, attachments: 1 })
emailSchema.index(
  {
    subject: 'text',
    'body.text': 'text',
  },
  {
    name: 'search_email',
  },
)

const Email = mongoose.model('Email', emailSchema)
export default Email
