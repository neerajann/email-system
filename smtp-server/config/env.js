import dotenv from 'dotenv'
dotenv.config({ quiet: true })

if (!process.env.DOMAIN_NAME) {
  throw new Error('Missing DOMAIN_NAME')
}
