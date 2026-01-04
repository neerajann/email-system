import authRouter from './authRoutes.js'
import mailRouter from './mailRoutes.js'

const router = async (fastify) => {
  await fastify.register(authRouter, { prefix: '/api/auth' })
  await fastify.register(mailRouter, { prefix: '/api/mail' })
}

export default router
