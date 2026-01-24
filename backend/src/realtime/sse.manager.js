const clients = new Map()
const addClient = ({ userId, reply }) => {
  if (!clients.has(userId)) {
    clients.set(userId, new Set())
  }
  clients.get(userId).add(reply)
}

const removeClient = ({ userId, reply }) => {
  clients.get(userId)?.delete(reply)
}

export default { addClient, removeClient, clients }
