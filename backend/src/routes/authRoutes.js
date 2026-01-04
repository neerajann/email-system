import authController from '../controllers/authController.js'
import verifyJWT from '../middlewares/verifyJWT.js'
import { loginSchema, registerSchema } from '../schemas/authSchema.js'

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
