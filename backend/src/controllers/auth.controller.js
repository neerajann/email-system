import authService from '../services/auth/auth.service.js'
import handleAuthError from '../utils/handleAuthError.js'
import jwt from 'jsonwebtoken'

const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token'

const registerUser = async (req, reply) => {
  try {
    await authService.registerUserService({
      name: req.body.name.trim(),
      emailAddress: req.body.emailAddress.trim().toLowerCase(),
      password: req.body.password.trim(),
    })
    return reply.code(201).send({
      success: 'Account registered successfully. Please procced to login',
    })
  } catch (err) {
    handleAuthError(err, reply)
  }
}

const loginUser = async (req, reply) => {
  try {
    const jwtToken = await authService.loginUserService(
      req.body.emailAddress.trim().toLowerCase(),
      req.body.password.trim(),
    )
    reply.setCookie(JWT_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 10,
      sameSite: 'lax',
      path: '/',
    })
    return reply.code(200).send({ success: 'Logged in successfully' })
  } catch (err) {
    handleAuthError(err, reply)
  }
}

const logoutUser = async (req, reply) => {
  reply.clearCookie(JWT_COOKIE_NAME)
  return reply.code(200).send({ success: 'Logged out successfully' })
}

const checkUser = async (req, reply) => {
  const jwtToken = req.cookies?.[JWT_COOKIE_NAME]
  if (!jwtToken)
    return reply.send({
      user: null,
    })

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET)
    if (decoded.emailAddress && decoded._id) {
      return reply.send({
        user: { emailAddress: decoded.emailAddress, id: decoded._id },
      })
    }
    reply.clearCookie(JWT_COOKIE_NAME)
    return reply.send({
      user: null,
    })
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: 'Something went wrong' })
  }
}

export default { registerUser, loginUser, logoutUser, checkUser }
