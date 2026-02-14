import authRouter from './auth.routes.js'
import eventRouter from './event.routes.js'
import mailRouter from './mail.routes.js'

// All routes
const router = async (fastify) => {
  await fastify.register(authRouter, { prefix: '/api/auth' })
  await fastify.register(mailRouter, { prefix: '/api/mail' })
  await fastify.register(eventRouter, { prefix: '/api/events' })
}

export default router
