import sseManager from '../realtime/sse.manager.js'

const connect = (req, reply) => {
  reply.raw.setHeader('Content-Type', 'text/event-stream')
  reply.raw.setHeader('Cache-Control', 'no-cache')
  reply.raw.setHeader('Connection', 'keep-alive')
  // Set CORS header if ENABLE_CORS is true
  process.env?.ENABLE_CORS === 'true' &&
    reply.raw.setHeader(
      'Access-Control-Allow-Origin',
      `${process.env.ALLOWED_ORIGIN}`,
    )
  reply.raw.setHeader('Access-Control-Allow-Credentials', 'true')
  reply.raw.flushHeaders?.() // Send instant reply with headers only
  reply.raw.write('\n')

  // Add user to sse clients map
  sseManager.addClient({ userId: req.userId, reply })
  req.raw.on('close', () => {
    sseManager.removeClient({ userId: req.userId, reply })
  })
}

export default { connect }
