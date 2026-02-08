if (process.env.NODE_ENV === 'development') {
  await import('dotenv/config')
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}
