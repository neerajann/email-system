import { domainEmailPattern, passwordPattern } from '@email-system/core/utils'

const registerSchema = {
  body: {
    type: 'object',
    required: ['name', 'emailAddress', 'password'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 25,
        errorMessage: {
          minLength: 'Name is requried.',
          maxLength: 'Name cannot be longer than 25 characters.',
        },
      },
      emailAddress: {
        type: 'string',
        maxLength: 30,
        pattern: domainEmailPattern.source,
        errorMessage: {
          maxLength: 'Email address cannot exceed 30 characters.',
          pattern: 'Invalid email address',
        },
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 30,
        pattern: passwordPattern.source,
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
        name: 'Name is requried.',
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
        pattern: domainEmailPattern.source,
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
