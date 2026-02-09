import mongoose from 'mongoose'

const connectDB = async () => {
  if (!process.env.MONGO_DB_URL) {
    throw new Error('Missinng MONGO_DB_URL')
  }

  try {
    await mongoose.connect(process.env.MONGO_DB_URL)
    console.log('Connected to DB')
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export default connectDB
