import redis from '../config/redis.js'

const USER_HOURLY_EMAIL_LIMIT =
  Number(process.env.USER_HOURLY_EMAIL_LIMIT) || 50

// Checks if the user has exceeded their hourly email sending limit
const emailRateLimiter = async (req, reply) => {
  const key = `user:${req.userId}:rate_limit`
  const count = await redis.incr(key) // Increment count with each send email request

  if (count === 1) {
    await redis.expire(key, 60 * 60) // Resets the limit after 1 hour
    return
  }

  // Send back 429 if limit exceeded
  if (count > USER_HOURLY_EMAIL_LIMIT) {
    return reply.code(429).send({
      error: 'Rate limit exceeded. Please retry later.',
    })
  }
}
export default emailRateLimiter
