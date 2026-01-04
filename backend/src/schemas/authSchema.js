import { domainEmailPattern, passwordPattern } from '../utils/pattern.js'

const registerSchema = {
  body: {
    type: 'object',
    required: ['firstName', 'lastName', 'emailAddress', 'password'],
    properties: {
      firstName: {
        type: 'string',
        minLength: 1,
        maxLength: 15,
        errorMessage: {
          minLength: 'First Name is requried.',
          maxLength: 'First name cannot be longer than 15 characters.',
        },
      },
      lastName: {
        type: 'string',
        minLength: 1,
        maxLength: 15,
        errorMessage: {
          minLength: 'First Name is requried.',
          maxLength: 'First name cannot be longer than 15 characters.',
        },
      },
      emailAddress: {
        type: 'string',
        maxLength: 30,
        pattern: domainEmailPattern,
        errorMessage: {
          maxLength: 'Email address cannot exceed 30 characters.',
          pattern: 'Invalid email address',
        },
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 30,
        pattern: passwordPattern,
        errorMessage: {
          maxLength: 'Password cannot exceed 30 characters.',
          minLength: 'Password is required',
          pattern:
            'The password must be at least 6 character long and includes uppercase, lowercase, numbers and symbols',
        },
      },
    },
    errorMessage: {
      type: 'Missing body.',
      required: {
        firstName: 'First name is requried.',
        lastName: 'Last name is required',
        password: 'Password is required',
        emailAddress: 'Email address is required',
      },
    },
  },
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['emailAddress', 'password'],
    properties: {
      emailAddress: {
        type: 'string',
        maxLength: 30,
        pattern: domainEmailPattern,
        errorMessage: {
          pattern: 'Invalid email address.',
        },
      },
      password: {
        type: 'string',
      },
    },
    errorMessage: {
      required: {
        emailAddress: 'Email address is required',
        password: 'Password is required',
      },
    },
  },
}

export { registerSchema, loginSchema }
