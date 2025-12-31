import mongoose from 'mongoose'

const verifyObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: 'Route not found' })
  }
  req.mailboxId = req.params.id
  next()
}
export default verifyObjectId
