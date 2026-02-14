import IORedis from 'ioredis'

const REDIS_PORT = process.env.REDIS_PORT

if (!process.env.REDIS_HOST) {
  throw new Error('Missing  REDIS_HOST')
}

// Create a new redis connection for subscriber
const subscriber = new IORedis({
  host: process.env.REDIS_HOST,
  port: REDIS_PORT,
})

// In memory storage of clients
const clients = new Map()

// Subscribe to sse: events
subscriber.psubscribe('sse:*')

const addClient = ({ userId, reply }) => {
  // If client doesnot exist add it to the map
  if (!clients.has(userId)) {
    clients.set(userId, new Set())
  }
  // Add the client's reply object to memory
  clients.get(userId).add(reply)
}

const removeClient = ({ userId, reply }) => {
  // Delete client with given userId and reply object
  clients.get(userId)?.delete(reply)
  if (clients.get(userId)?.size === 0) {
    clients.delete(userId)
  }
}

// When an message arrrives from the sse event that this has subscribed to
subscriber.on('pmessage', (pattern, channel, message) => {
  const userId = channel.split(':')[1] // The channel looks like this SSE:userID, so splitting gives us the userId
  const userClients = clients.get(userId)

  // If the user has active sessions in memory
  if (userClients) {
    // Send the message to all open SSE connections for this user
    for (const reply of userClients) {
      reply.raw.write(`data:${message}\n\n`)
    }
  }
})

export default { addClient, removeClient }
