import verifyJWT from '../middlewares/verifyJWT.js'
import verifyObjectId from '../middlewares/verifyObjectId.js'
import mailController from '../controllers/mail.controller.js'
import attachmentController from '../controllers/attachment.controller.js'

import {
  attachmentSchema,
  emailSchema,
  patchMailSchema,
} from '../schemas/mail.schema.js'

const mailRouter = async (fastify) => {
  fastify.get('/inbox', { preHandler: verifyJWT }, mailController.getInbox)
  fastify.get('/sent', { preHandler: verifyJWT }, mailController.getSent)
  fastify.get('/trash', { preHandler: verifyJWT }, mailController.getTrash)
  fastify.get(
    '/starred',
    {
      preHandler: verifyJWT,
    },
    mailController.getStarred
  )
  fastify.post(
    '/send',

    { preHandler: verifyJWT, schema: emailSchema },
    mailController.sendMail
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

  fastify.patch(
    '/:id',
    {
      preHandler: [verifyJWT, verifyObjectId],
      schema: patchMailSchema,
    },
    mailController.patchMail
  )

  fastify.delete(
    '/:id',
    {
      preHandler: [verifyJWT, verifyObjectId],
    },
    mailController.deleteMail
  )
}

export default mailRouter
