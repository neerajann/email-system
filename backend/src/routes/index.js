import authRouter from './auth.routes.js'
import mailRouter from './mail.routes.js'

const router = async (fastify) => {
  await fastify.register(authRouter, { prefix: '/api/auth' })
  await fastify.register(mailRouter, { prefix: '/api/mail' })
}

export default router
