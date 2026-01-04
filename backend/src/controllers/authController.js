import authService from '../services/authService.js'
import handleAuthError from '../utils/handleAuthError.js'
import jwt from 'jsonwebtoken'

const registerUser = async (req, reply) => {
  try {
    await authService.registerUserService({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      emailAddress: req.body.emailAddress.trim().toLowerCase(),
      password: req.body.password.trim(),
    })
    return reply.code(201).send({
      sucess: 'Account registered successfully. Please procced to login',
    })
  } catch (err) {
    handleAuthError(err, reply)
  }
}

const loginUser = async (req, reply) => {
  try {
    const jwtToken = await authService.loginUserService(
      req.body.emailAddress.trim().toLowerCase(),
      req.body.password.trim()
    )
    reply.setCookie(process.env.JWT_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 10,
      sameSite: 'lax',
      path: '/',
    })
    return reply.code(200).send({ sucess: 'Logged in successfully' })
  } catch (err) {
    handleAuthError(err, reply)
  }
}

const logoutUser = (req, reply) => {
  reply.clearCookie(process.env.JWT_COOKIE_NAME)
  return reply.code(200).send({ sucess: 'Logged out successfully' })
}

const checkUser = (req, reply) => {
  const jwtToken = req.cookies?.[process.env.JWT_COOKIE_NAME]
  if (!jwtToken) return reply.send([])

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET)
    if (decoded.emailAddress && decoded._id) {
      return reply.send({ emailAddress: decoded.emailAddress, id: decoded._id })
    }
    reply.clearCookie(process.env.JWT_COOKIE_NAME)
    return reply.send([])
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
  }
}

export default { registerUser, loginUser, logoutUser, checkUser }
