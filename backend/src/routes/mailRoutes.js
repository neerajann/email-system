import express from 'express'
import verifyJWT from '../middlewares/verifyJWT.js'
import verifyObjectId from '../middlewares/verifyObjectId.js'
import mailController from '../controllers/mailController.js'

const mailRouter = express.Router()

mailRouter.get('/api/mail/inbox', verifyJWT, mailController.getInbox)
mailRouter.get('/api/mail/sent', verifyJWT, mailController.getSent)
mailRouter.get('/api/mail/trash', verifyJWT, mailController.getTrash)
mailRouter.post('/api/mail/send', verifyJWT, mailController.sendMail)
mailRouter.post('/api/mail/:id/trash/', verifyJWT, mailController.trashMail)
mailRouter.post('/api/mail/:id/restore', verifyJWT, mailController.restoreMail)
mailRouter.post('/api/mail/upload', verifyJWT, mailController.uploadAttachments)

mailRouter.get(
  '/api/mail/attachment/:id',
  verifyJWT,
  verifyObjectId,
  mailController.downloadAttachment
)

mailRouter.get(
  '/api/mail/:id',
  verifyJWT,
  verifyObjectId,
  mailController.getMail
)

export default mailRouter
