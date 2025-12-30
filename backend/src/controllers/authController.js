import authService from '../services/authService.js'
import handleAuthError from '../utils/handleAuthError.js'

const registerUser = async (req, res) => {
  try {
    const user = await authService.registerUserService({
      firstName: req.body?.firstName?.trim(),
      lastName: req.body?.lastName?.trim(),
      emailAddress: req.body?.emailAddress?.trim().toLowerCase(),
      password: req.body?.password?.trim(),
    })
    return res.status(201).json({
      sucess: 'Account registered successfully. Please procced to login',
      userId: user._id,
    })
  } catch (err) {
    handleAuthError(err, res)
  }
}

const loginUser = async (req, res) => {
  try {
    const jwtToken = await authService.loginUserService(
      req.body?.emailAddress?.trim()?.toLowerCase(),
      req.body?.password?.trim()
    )
    res.cookie(process.env.JWT_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 10,
      sameSite: 'lax',
    })
    return res.status(200).json({ sucess: 'Logged in successfully' })
  } catch (err) {
    handleAuthError(err, res)
  }
}

const logoutUser = (req, res) => {
  res.clearCookie(process.env.JWT_COOKIE_NAME)
  return res.status(200).json({ sucess: 'Logged out successfully' })
}
export default { registerUser, loginUser, logoutUser }
