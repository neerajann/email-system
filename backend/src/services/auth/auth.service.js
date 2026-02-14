import bcrypt from 'bcrypt'
import { User } from '@email-system/core/models'
import jwt from 'jsonwebtoken'

const JWT_EXPIRY = process.env.JWT_EXPIRY || '10d'

const registerUserService = async ({ name, emailAddress, password }) => {
  // Check if user exist with given emailAddress
  const existingUser = await User.findOne({
    emailAddress: emailAddress,
  })

  if (existingUser) throw new Error('EMAIL_EXIST')

  // Hash password using bcrypt with 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({
    name: name,
    emailAddress: emailAddress,
    password: hashedPassword,
  })
}

const loginUserService = async (emailAddress, password) => {
  const existingUser = await User.findOne({
    emailAddress: emailAddress,
  })
  if (!existingUser) throw new Error('INVALID_CREDENTIALS')

  // Compare  stored password hash and password provided by user using bcrypt
  const passwordMatch = await bcrypt.compare(password, existingUser.password)
  if (!passwordMatch) throw new Error('INVALID_CREDENTIALS')

  // Return jwt signed using JWT_SECRET
  return jwt.sign(
    {
      emailAddress: existingUser.emailAddress,
      _id: existingUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    },
  )
}
export default { registerUserService, loginUserService }
