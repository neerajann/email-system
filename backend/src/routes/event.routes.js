import verifyJWT from '../middlewares/verifyJWT.js'
import eventsController from '../controllers/events.controller.js'

const eventRouter = async (fastify) => {
  fastify.get('/', { preHandler: verifyJWT }, eventsController.connect)
}

export default eventRouter
