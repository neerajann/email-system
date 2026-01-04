import mongoose from 'mongoose'

const mailBoxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Email',
      required: true,
    },
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
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

mailBoxSchema.index({ userId: 1, emailId: 1 })

mailBoxSchema.index({ userId: 1, labels: 1, isDeleted: 1 })

mailBoxSchema.index({ userId: 1, threadId: 1, isDeleted: 1 })

const Mailbox = mongoose.model('Mailbox', mailBoxSchema)
export default Mailbox
