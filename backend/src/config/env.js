import dotenv from 'dotenv'
dotenv.config({ quiet: true })

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}

if (!process.env.DOMAIN_NAME) {
  throw new Error('Missing DOMAIN_NAME')
}
