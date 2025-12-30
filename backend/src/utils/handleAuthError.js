const handleAuthError = (err, res) => {
  switch (err.message) {
    case 'MISSING_PARAMETERS':
      return res.status(400).json({ error: 'Some parameters are missing' })

    case 'INVALID_EMAIL':
      return res.status(400).json({ error: 'Invalid email address' })

    case 'INVALID_PASSWORD':
      return res.status(400).json({
        error:
          'The password must be at least 6 character long and includes uppercase, lowercase, numbers and symbols',
      })
    case 'EMAIL_EXIST':
      return res
        .status(409)
        .json({ error: 'That email address is taken. Try another.' })
    case 'MISSING_CREDENTIALS':
      return res.status(400).json({ error: 'Missing credientals' })
    case 'INVALID_CREDENTIALS':
      return res.status(404).json({ error: 'Invalid credientals' })

    default: {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong' })
    }
  }
}
export default handleAuthError
