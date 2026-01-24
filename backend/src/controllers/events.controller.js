import sseManager from '../realtime/sse.manager.js'

const connect = (req, reply) => {
  reply.headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  reply.raw.flushHeaders?.()
  reply.raw.write('\n')

  sseManager.addClient({ userId: req.userId, reply })
  req.raw.on('close', () => {
    sseManager.removeClient({ userId: req.userId, reply })
  })
}

export default { connect }
