import express from 'express'
import authRouter from './authRoutes.js'
import mailRouter from './mailRoutes.js'

const router = express.Router()

router.use(authRouter)
router.use(mailRouter)

router.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default router
