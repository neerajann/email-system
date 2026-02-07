import { MongoClient } from 'mongodb'
import env from 'dotenv'

env.config({ quiet: true })

let client
let db

const connectDatabase = async () => {
  client = new MongoClient(process.env.MONGO_DB_URL)
  await client.connect()
  db = client.db('dns')
  console.log('[MongoDB] connected')
  return db
}

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase first.')
  }
  return db
}

const getRecordsCollection = () => {
  return getDatabase().collection('records')
}

const getBlocklistCollection = () => {
  return getDatabase().collection('blocklist')
}

export {
  connectDatabase,
  getDatabase,
  getRecordsCollection,
  getBlocklistCollection,
}
