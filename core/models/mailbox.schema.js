import mongoose from 'mongoose'

const mailBoxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emailIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Email',
      },
    ],
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
      required: true,
    },
    labels: {
      type: [String],
      default: ['INBOX'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

mailBoxSchema.index({ userId: 1, emailIds: 1 })

mailBoxSchema.index({ userId: 1, labels: 1, isDeleted: 1 })

mailBoxSchema.index({ userId: 1, threadId: 1, isDeleted: 1 })

const Mailbox = mongoose.model('Mailbox', mailBoxSchema)
export default Mailbox
