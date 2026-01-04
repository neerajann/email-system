import mongoose from 'mongoose'

const verifyObjectId = async (req, reply) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return reply.code(404).send({ error: 'Route not found' })
  }
  req.mailboxId = req.params.id
}
export default verifyObjectId
