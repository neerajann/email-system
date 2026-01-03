const handleAuthError = (err, res) => {
  switch (err.message) {
    case 'MISSING_PARAMETERS':
      return res.status(400).json({ error: 'Some parameters are missing' })

    case 'NAME_MAX_LENGTH_EXCEEDED':
      return res.status(400).json({
        error: 'First Name and Last Name cannot exceeded 15 characters.',
      })

    case 'ADDRESS_MAX_LENGTH_EXCEEDED':
      return res.status(400).json({
        error: 'Max length of Email address can be 25.',
      })

    case 'PASSWORD_MAX_LENGTH_EXCEEDED':
      return res.status(400).json({
        error: 'Password cannot exceed 30 characters.',
      })

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
