const notifyUser = async (notifications, publisher) => {
  const pipeline = publisher.pipeline()
  notifications.forEach(({ userId, newMail }) => {
    pipeline.publish(`sse:${userId}`, JSON.stringify(newMail))
  })
  await pipeline.exec()
}
export default notifyUser
