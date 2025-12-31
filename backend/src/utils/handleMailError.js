const handleMailError = (res, err) => {
  switch (err.message) {
    case 'INVALID_EMAIL':
      return res.status(400).json({ error: 'Invalid email address.' })

    case 'ADDRESS_NOT_FOUND':
      return res.status(404).json({ error: 'Address not found.' })

    case 'MAIL_DELIVERY_ERROR':
      console.error(err)
      return res.status(502).json({ error: 'Mail delivery failed.' })

    case 'EMAIL_NOT_FOUND':
      return res
        .status(404)
        .json({ error: "Couldn't find email with the given id." })

    default:
      console.error(err)
      return res.status(500).json({ error: 'Something went wrong.' })
  }
}

export default handleMailError
