import IORedis from 'ioredis'

const REDIS_PORT = process.env.REDIS_PORT

if (!process.env.REDIS_HOST) {
  throw new Error('Missing  REDIS_HOST')
}

const subscriber = new IORedis({
  host: process.env.REDIS_HOST,
  port: REDIS_PORT,
})

const clients = new Map()

subscriber.psubscribe('sse:*')

const addClient = ({ userId, reply }) => {
  if (!clients.has(userId)) {
    clients.set(userId, new Set())
  }
  clients.get(userId).add(reply)
}

const removeClient = ({ userId, reply }) => {
  clients.get(userId)?.delete(reply)
  if (clients.get(userId)?.size === 0) {
    clients.delete(userId)
  }
}

subscriber.on('pmessage', (pattern, channel, message) => {
  const userId = channel.split(':')[1]
  const userClients = clients.get(userId)

  if (userClients) {
    for (const reply of userClients) {
      reply.raw.write(`data:${message}\n\n`)
    }
  }
})

export default { addClient, removeClient }
