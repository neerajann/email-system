import authController from '../controllers/auth.controller.js'
import verifyJWT from '../middlewares/verifyJWT.js'
import { loginSchema, registerSchema } from '../schemas/auth.schema.js'

const authRouter = (fastify) => {
  fastify.get('/me', authController.checkUser)

  fastify.post(
    '/register',
    { schema: registerSchema },
    authController.registerUser
  )

  fastify.post('/login', { schema: loginSchema }, authController.loginUser)

  fastify.post('/logout', { preHandler: verifyJWT }, authController.logoutUser)
}
export default authRouter
