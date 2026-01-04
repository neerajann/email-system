const handleAuthError = (err, reply) => {
  switch (err.message) {
    case 'EMAIL_EXIST':
      return reply
        .code(409)
        .send({ error: 'That email address is taken. Try another.' })

    case 'INVALID_CREDENTIALS':
      return reply.code(404).send({ error: 'Invalid credientals' })

    default: {
      return reply.code(500).send({ error: 'Something went wrong' })
    }
  }
}
export default handleAuthError
