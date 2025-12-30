import { domainEmailPattern, passwordPattern } from '../utils/pattern.js'
import bcrypt from 'bcrypt'
import User from '../models/userSchema.js'
import jwt from 'jsonwebtoken'

const registerUserService = async ({
  firstName,
  lastName,
  emailAddress,
  password,
}) => {
  if (!firstName || !lastName || !emailAddress || !password)
    throw new Error('MISSING_PARAMETERS')

  if (!domainEmailPattern.test(emailAddress)) throw new Error('INVALID_EMAIL')

  if (!passwordPattern.test(password)) throw new Error('INVALID_PASSWORD')

  const existingUser = await User.findOne({
    emailAddress: emailAddress,
  })

  if (existingUser) throw new Error('EMAIL_EXIST')

  const hashedPassword = await bcrypt.hash(password, 10)

  return await User.create({
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    password: hashedPassword,
  })
}

const loginUserService = async (emailAddress, password) => {
  if (!emailAddress || !password) throw new Error('MISSING_CREDENTIALS')
  if (!domainEmailPattern.test(emailAddress)) throw new Error('INVALID_EMAIL')
  const existingUser = await User.findOne({
    emailAddress: emailAddress,
  })
  if (!existingUser) throw new Error('INVALID_CREDENTIALS')
  const passwordMatch = await bcrypt.compare(password, existingUser.password)
  if (!passwordMatch) throw new Error('INVALID_CREDENTIALS')

  return jwt.sign(
    {
      emailAddress: existingUser.emailAddress,
      _id: existingUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  )
}
export default { registerUserService, loginUserService }
