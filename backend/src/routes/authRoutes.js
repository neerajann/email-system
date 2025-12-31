import express from 'express'
import authController from '../controllers/authController.js'
import verifyJWT from '../middlewares/verifyJWT.js'

const authRouter = express.Router()

authRouter.get('/api/me', authController.checkUser)
authRouter.post('/api/register', authController.registerUser)
authRouter.post('/api/login', authController.loginUser)
authRouter.post('/api/logout', verifyJWT, authController.logoutUser)

export default authRouter
