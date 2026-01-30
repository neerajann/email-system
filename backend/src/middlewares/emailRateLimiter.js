import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

const emailRateLimiter = async (req, reply) => {
  const key = `user:${req.userId}:rate_limit`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 60 * 60)
    return
  }

  if (count > 50) {
    return reply.code(429).send({
      error: 'Rate limit exceeded. Please retry later.',
    })
  }
}
export default emailRateLimiter
