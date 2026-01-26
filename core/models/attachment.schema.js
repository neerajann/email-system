import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['temporary', 'attached'],
      default: 'temporary',
    },
  },
  { timestamps: true }
)

const Attachment = mongoose.model('Attachment', attachmentSchema)
export default Attachment
