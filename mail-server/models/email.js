import mongoose from 'mongoose'

const emailSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    body: {
      text: {
        type: String,
      },
      html: {
        type: String,
      },
    },

    attachments: [
      {
        filename: String,
        contentType: String,
        size: Number,
        path: String,
      },
    ],

    flags: {
      seen: {
        type: Boolean,
        default: false,
      },
    },

    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export const Email = mongoose.model('Email', emailSchema)
