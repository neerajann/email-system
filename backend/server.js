import './src/config/env.js'
import Fastify from 'fastify'
import connectDB from '@email-system/core/config'
import router from './src/routes/index.js'
import cors from '@fastify/cors'
import cookieParser from '@fastify/cookie'
import ajvErrors from 'ajv-errors'
import fastifyMultipart from '@fastify/multipart'
import { styleText } from 'node:util'

const PORT = process.env.PORT || 3000

// Initialize Fastify server with AJV error handling
const fastify = Fastify({
  ajv: {
    customOptions: {
      allErrors: true,
      coerceTypes: false,
    },
    plugins: [ajvErrors],
  },
})

// Global error handler for uncaught errors and request validation
fastify.setErrorHandler((error, req, reply) => {
  if (error.validation) {
    return reply.code(400).send({
      error: error.validation[0].message,
    })
  }
  if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
    return reply.code(400).send({
      error: 'Body is not valid JSON',
    })
  }
  console.log(error)
  return reply.code(500).send({
    error: 'Something went wrong',
  })
})

await connectDB()

// Register cors if ENABLE_CORS is true
if (process.env.ENABLE_CORS === 'true') {
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
}

// Register cookier parser middkeware
await fastify.register(cookieParser)

// Middleware to handle multipart form data (like files)
await fastify.register(fastifyMultipart, {
  limits: {
    files: 10, // Max no of files that can be sent
    fileSize: 10 * 1024 * 1024, // Max size of file (10 MB)
  },
})

// Register all routes
await fastify.register(router)

// Handles route not found
fastify.setNotFoundHandler((req, reply) => {
  return reply.code(404).send({
    error: 'Route not found.',
  })
})

// Listen on specified port on all interfaces
fastify.listen(
  {
    port: PORT,
    host: '0.0.0.0',
  },
  (err) => {
    if (err) {
      console.log(err)
    }
    console.log(styleText('green', `Backend server listening on port ${PORT}`))
  },
)
