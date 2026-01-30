import { Email } from '@email-system/core/models'
import mongoose from 'mongoose'
import '../../src/config/env.js'
await mongoose.connect(process.env.MONGO_DB_URL)
await Email.syncIndexes()
console.log('Indexes initalized')
process.exit(0)
