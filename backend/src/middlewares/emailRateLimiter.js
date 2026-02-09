import redis from '../config/redis.js'

const USER_HOURLY_EMAIL_LIMIT =
  Number(process.env.USER_HOURLY_EMAIL_LIMIT) || 50

const emailRateLimiter = async (req, reply) => {
  const key = `user:${req.userId}:rate_limit`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 60 * 60)
    return
  }

  if (count > USER_HOURLY_EMAIL_LIMIT) {
    return reply.code(429).send({
      error: 'Rate limit exceeded. Please retry later.',
    })
  }
}
export default emailRateLimiter
