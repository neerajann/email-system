import mongoose from 'mongoose'

// Validates that req.params.id is a valid ObjectId.
const verifyObjectId = async (req, reply) => {
  // Returns 404 if invalid, avoiding unnecessary DB queries.
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return reply.code(404).send({ error: 'Route not found' })
  }
  req.mailboxId = req.params.id
}
export default verifyObjectId
