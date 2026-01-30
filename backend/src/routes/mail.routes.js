import verifyJWT from '../middlewares/verifyJWT.js'
import verifyObjectId from '../middlewares/verifyObjectId.js'
import mailController from '../controllers/mail.controller.js'
import attachmentController from '../controllers/attachment.controller.js'

import {
  attachmentDeleteSchema,
  attachmentSchema,
  emailSchema,
  patchMailSchema,
} from '../schemas/mail.schema.js'
import emailRateLimiter from '../middlewares/emailRateLimiter.js'

const mailRouter = async (fastify) => {
  fastify.get('/inbox', { preHandler: verifyJWT }, mailController.getInbox)
  fastify.get('/sent', { preHandler: verifyJWT }, mailController.getSent)
  fastify.get('/trash', { preHandler: verifyJWT }, mailController.getTrash)
  fastify.get(
    '/starred',
    {
      preHandler: verifyJWT,
    },
    mailController.getStarred,
  )
  fastify.get('/search', { preHandler: verifyJWT }, mailController.searchMail)

  fastify.post(
    '/send',

    { preHandler: [verifyJWT, emailRateLimiter], schema: emailSchema },
    mailController.sendMail,
  )

  fastify.post('/attachment', {
    preHandler: [verifyJWT, emailRateLimiter],
    ...attachmentController.uploadAttachments,
  })

  fastify.delete(
    '/attachment',
    { preHandler: [verifyJWT], schema: attachmentDeleteSchema },
    attachmentController.deleteAttachments,
  )

  fastify.get(
    '/attachment/:id',
    { preHandler: [verifyJWT, verifyObjectId], schema: attachmentSchema },
    attachmentController.downloadAttachment,
  )

  fastify.get(
    '/:id',
    { preHandler: [verifyJWT, verifyObjectId] },
    mailController.getMail,
  )

  fastify.patch(
    '/',
    {
      preHandler: [verifyJWT],
      schema: patchMailSchema,
    },
    mailController.patchMail,
  )

  fastify.delete(
    '/:id',
    {
      preHandler: [verifyJWT, verifyObjectId],
    },
    mailController.deleteMail,
  )
}

export default mailRouter
