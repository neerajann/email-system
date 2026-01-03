import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import './src/config/env.js'
import connectDB from './src/config/db.js'
import router from './src/routes/index.js'

const app = express()
await connectDB()

app.use(
  cors({
    origin: process.env.ORIGIN_ADDRESS,
  })
)

app.use(cookieParser())

app.use(express.json())

app.use(router)

app.listen(80, () => {
  console.log('Server listening on port 80')
})
