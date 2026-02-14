import authController from '../controllers/auth.controller.js'
import verifyJWT from '../middlewares/verifyJWT.js'
import { loginSchema, registerSchema } from '../schemas/auth.schema.js'

// Auth routes
const authRouter = (fastify) => {
  fastify.get('/me', authController.checkUser) // Endpoint to check who if a user is logged in or not

  // Register endpoint
  fastify.post(
    '/register',
    { schema: registerSchema },
    authController.registerUser,
  )

  // Login endpoint
  fastify.post('/login', { schema: loginSchema }, authController.loginUser)

  // Logout endpoint
  fastify.post('/logout', { preHandler: verifyJWT }, authController.logoutUser)
}
export default authRouter
