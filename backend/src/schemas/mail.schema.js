import { mongooseObjectIdPattern } from '@email-system/core/utils'

const emailSchema = {
  body: {
    type: 'object',
    required: ['recipients', 'subject', 'body'],
    additionalProperties: false,
    properties: {
      recipients: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
          format: 'email',
          errorMessage: {
            format: 'Invalid email address',
          },
        },
        errorMessage: {
          type: 'Recipients must be an array',
          minItems: 'At least one recipient is required',
        },
      },

      attachments: {
        type: 'array',
        items: {
          type: 'string',
          pattern: mongooseObjectIdPattern.source,
          errorMessage: {
            pattern: 'Invalid attachment id',
          },
        },
        errorMessage: {
          type: 'Attachments must be an array',
        },
      },

      subject: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        errorMessage: {
          minLength: 'Subject is required',
          maxLength: 'Subject is too long',
        },
      },

      body: {
        type: 'string',
        minLength: 1,
        errorMessage: {
          minLength: 'Email body is required',
        },
      },
    },

    errorMessage: {
      type: 'Missing body.',
      required: {
        recipients: 'Recipient list is required',
        subject: 'Subject is required',
        body: 'Email body is required',
      },
    },
  },
}

const trashMailSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: mongooseObjectIdPattern.source,
        errorMessage: {
          pattern: 'Invalid id.',
        },
      },
    },
    errorMessage: {
      required: {
        id: 'Id is missing.',
      },
    },
  },
}

const attachmentSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: mongooseObjectIdPattern.source,
        errorMessage: {
          pattern: 'Invalid attachment id.',
        },
      },
    },
    errorMessage: {
      required: {
        id: 'Missing attachment id',
      },
    },
  },
  query: {
    type: 'object',
    required: ['mailId'],
    properties: {
      mailId: {
        type: 'string',
        pattern: mongooseObjectIdPattern.source,
        errorMessage: {
          pattern: 'Invalid mail id.',
        },
      },
    },
    errorMessage: {
      required: {
        mailId: 'Missing parameter mail id.',
      },
    },
  },
}
export { emailSchema, trashMailSchema, attachmentSchema }
