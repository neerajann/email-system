import verifyJWT from '../middlewares/verifyJWT.js'
import verifyObjectId from '../middlewares/verifyObjectId.js'
import mailController from '../controllers/mail.controller.js'
import attachmentController from '../controllers/attachment.controller.js'

import {
  attachmentSchema,
  emailSchema,
  trashMailSchema,
} from '../schemas/mail.schema.js'

const mailRouter = async (fastify) => {
  fastify.get('/inbox', { preHandler: verifyJWT }, mailController.getInbox)
  fastify.get('/sent', { preHandler: verifyJWT }, mailController.getSent)
  fastify.get('/trash', { preHandler: verifyJWT }, mailController.getTrash)

  fastify.post(
    '/send',

    { preHandler: verifyJWT, schema: emailSchema },
    mailController.sendMail
  )

  fastify.post(
    '/:id/trash',
    { preHandler: verifyJWT, schema: trashMailSchema },
    mailController.trashMail
  )
  fastify.post(
    '/:id/restore',
    { preHandler: verifyJWT, schema: trashMailSchema },
    mailController.restoreMail
  )
  fastify.post(
    '/attachment',
    { preHandler: verifyJWT },
    attachmentController.uploadAttachments
  )

  fastify.get(
    '/attachment/:id',
    { preHandler: [verifyJWT, verifyObjectId], schema: attachmentSchema },
    attachmentController.downloadAttachment
  )

  fastify.get(
    '/:id',
    { preHandler: [verifyJWT, verifyObjectId] },
    mailController.getMail
  )
}

export default mailRouter
