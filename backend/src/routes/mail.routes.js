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

// Mail routes
const mailRouter = async (fastify) => {
  // Get mails received by a user
  fastify.get('/inbox', { preHandler: verifyJWT }, mailController.getInbox)

  // Get mails sent by a user
  fastify.get('/sent', { preHandler: verifyJWT }, mailController.getSent)

  // Get trash mails from user mailbox
  fastify.get('/trash', { preHandler: verifyJWT }, mailController.getTrash)

  // Get starred mails from user mailbox
  fastify.get(
    '/starred',
    {
      preHandler: verifyJWT,
    },
    mailController.getStarred,
  )
  // Endpoint to search for a mail in user mailboxes
  fastify.get('/search', { preHandler: verifyJWT }, mailController.searchMail)

  // Endpoint to send mail(new mail,reply,forward)
  fastify.post(
    '/send',

    { preHandler: [verifyJWT, emailRateLimiter], schema: emailSchema },
    mailController.sendMail,
  )

  // Endpoint to upload attachment
  fastify.post('/attachment', {
    preHandler: [verifyJWT, emailRateLimiter],
    ...attachmentController.uploadAttachments,
  })

  // Endpoint to delete attachments (only the attachment that are not attached to a mail can be deleted)
  fastify.delete(
    '/attachment',
    { preHandler: [verifyJWT], schema: attachmentDeleteSchema },
    attachmentController.deleteAttachments,
  )

  // Endpoint to view or download an attachment
  fastify.get(
    '/attachment/:id',
    { preHandler: [verifyJWT, verifyObjectId], schema: attachmentSchema },
    attachmentController.downloadAttachment,
  )
  // Endpoint to patch mails (star/unstar,mark as read/unread, trash)
  fastify.patch(
    '/',
    {
      preHandler: [verifyJWT],
      schema: patchMailSchema,
    },
    mailController.patchMail,
  )

  // Endpoint to get recipients suggestions when composing mail
  fastify.get(
    '/recipients/suggestions',
    {
      preHandler: verifyJWT,
    },
    mailController.getRecipientsSuggestion,
  )

  // Get individual mail
  fastify.get(
    '/:id',
    { preHandler: [verifyJWT, verifyObjectId] },
    mailController.getMail,
  )

  // Endpoint to delete mail from user mailbox forever
  fastify.delete(
    '/:id',
    {
      preHandler: [verifyJWT, verifyObjectId],
    },
    mailController.deleteMail,
  )
}

export default mailRouter
