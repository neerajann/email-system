import verifyJWT from '../middlewares/verifyJWT.js'
import eventsController from '../controllers/events.controller.js'

// Route for Server Sent Events
const eventRouter = async (fastify) => {
  fastify.get('/', { preHandler: verifyJWT }, eventsController.connect)
}

export default eventRouter
