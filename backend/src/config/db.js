import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL)
    console.log('Connected to the DB')
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export default connectDB
