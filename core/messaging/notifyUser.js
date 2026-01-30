import IORedis from 'ioredis'
const publisher = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

const notifyUser = async (notifications) => {
  const pipeline = publisher.pipeline()
  notifications.forEach(({ userId, newMail }) => {
    pipeline.publish(`sse:${userId}`, JSON.stringify(newMail))
  })
  await pipeline.exec()
}
export default notifyUser
