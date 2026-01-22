const handleMailError = (reply, err) => {
  switch (err.message) {
    case 'ADDRESS_NOT_FOUND':
      return reply.code(404).send({ error: 'Address not found.' })

    case 'MAIL_DELIVERY_ERROR':
      console.error(err)
      return reply.code(502).send({ error: 'Mail delivery failed.' })

    case 'DATABASE_ERROR':
      console.log(err)
      return reply.code(500).send({ error: 'Failed to save mail.' })

    case 'INVALID_ATTACHMENTS':
      return reply
        .code(400)
        .send({ error: "Couldn't send the attachment.Try uploading again." })

    case 'EMAIL_NOT_FOUND':
      return reply
        .code(404)
        .send({ error: "Couldn't find email with the given id." })

    case 'USER_NOT_FOUND':
      return reply.code(404).send({
        error: 'Sender not found.',
      })

    case 'UNAUTHORIZED_REPLY':
      return reply.code(401).send({
        error: "You're not authorized to reply to this mail.",
      })

    default:
      console.error(err)
      return reply.code(500).send({ error: 'Something went wrong.' })
  }
}

export default handleMailError
