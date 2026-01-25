import sseManager from '../realtime/sse.manager.js'

const connect = (req, reply) => {
  reply.raw.setHeader('Content-Type', 'text/event-stream')
  reply.raw.setHeader('Cache-Control', 'no-cache')
  reply.raw.setHeader('Connection', 'keep-alive')
  reply.raw.setHeader(
    'Access-Control-Allow-Origin',
    `${process.env.ORIGIN_ADDRESS}`,
  )
  reply.raw.setHeader('Access-Control-Allow-Credentials', 'true')
  reply.raw.flushHeaders?.()
  reply.raw.write('\n')

  sseManager.addClient({ userId: req.userId, reply })
  req.raw.on('close', () => {
    sseManager.removeClient({ userId: req.userId, reply })
  })
}

export default { connect }
