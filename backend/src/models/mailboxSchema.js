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

//getting individual mails
mailBoxSchema.index({ userId: 1, emailId: 1 })
//  updating mailbox
mailBoxSchema.index({ _id: 1, userId: 1, isDeleted: 1 })
//// for getting mails from mailbox
mailBoxSchema.index({ userId: 1, labels: 1, isDeleted: 1 })
// thread based updates and individual mail fetching
mailBoxSchema.index({ userId: 1, threadId: 1 })

const Mailbox = mongoose.model('Mailbox', mailBoxSchema)
export default Mailbox
