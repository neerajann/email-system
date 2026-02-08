import jwt from 'jsonwebtoken'
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token'

const verifyJWT = async (req, reply) => {
  const jwtToken = req.cookies?.[JWT_COOKIE_NAME]
  if (!jwtToken) {
    return reply
      .code(403)
      .send({ error: 'You are not autheticated.Please login first' })
  }

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET)
    if (decoded.emailAddress && decoded._id) {
      req.user = decoded.emailAddress
      req.userId = decoded._id
      return
    }
    reply.clearCookie(JWT_COOKIE_NAME)
    return reply
      .code(403)
      .send({ error: 'You are not autheticated.Please login first' })
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
  }
}

export default verifyJWT
