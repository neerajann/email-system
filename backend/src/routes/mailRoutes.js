import express from 'express'
import verifyJWT from '../middlewares/verifyJWT.js'
import mailController from '../controllers/mailController.js'
const mailRouter = express.Router()

mailRouter.get('/api/mail/inbox', verifyJWT, mailController.getInbox)
mailRouter.get('/api/mail/sent', verifyJWT, mailController.getSent)
mailRouter.get('/api/mail/trash', verifyJWT, mailController.getTrash)
mailRouter.post('/api/mail/send', verifyJWT, mailController.sendMail)

export default mailRouter
