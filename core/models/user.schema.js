import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

const User = mongoose.model('User', userSchema)
export default User
