import mongoose from 'mongoose'
import { styleText } from 'node:util'

const connectDB = async () => {
  if (!process.env.MONGO_DB_URL) {
    throw new Error('Missinng MONGO_DB_URL')
  }

  try {
    await mongoose.connect(process.env.MONGO_DB_URL)
    console.log(styleText('green', 'Connected to DB'))
  } catch (error) {
    console.log(styleText('red', error))
    process.exit(1)
  }
}

export default connectDB
