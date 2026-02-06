import Fastify from 'fastify'
import './src/config/env.js'
import connectDB from '@email-system/core/config'
import router from './src/routes/index.js'
import cors from '@fastify/cors'
import cookieParser from '@fastify/cookie'
import ajvErrors from 'ajv-errors'
import fastifyMultipart from '@fastify/multipart'

const fastify = Fastify({
  ajv: {
    customOptions: {
      allErrors: true,
      coerceTypes: false,
    },
    plugins: [ajvErrors],
  },
})

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

if (process.env.ENABLE_CORS === 'true') {
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
}

await fastify.register(cookieParser)

await fastify.register(fastifyMultipart, {
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },
})

await fastify.register(router)

fastify.setNotFoundHandler((req, reply) => {
  return reply.code(404).send({
    error: 'Route not found.',
  })
})

fastify.listen(
  {
    port: 80,
    host: '0.0.0.0',
  },
  (err) => {
    if (err) {
      console.log(err)
    }
    console.log('Server running on port 80')
  },
)
