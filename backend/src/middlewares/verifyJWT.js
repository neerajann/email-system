import jwt from 'jsonwebtoken'

const verifyJWT = async (req, res, next) => {
  const jwtToken = req.cookies?.[process.env.JWT_COOKIE_NAME]
  if (!jwtToken)
    return res
      .status(403)
      .json({ error: 'You are not autheticated.Please login first' })

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET)
    if (decoded.emailAddress && decoded._id) {
      req.user = decoded.emailAddress
      req.userId = decoded._id
      return next()
    }
    res.clearCookie(process.env.JWT_COOKIE_NAME)
    return res
      .status(403)
      .json({ error: 'You are not autheticated.Please login first' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

export default verifyJWT
