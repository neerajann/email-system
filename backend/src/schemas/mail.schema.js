import { mongooseObjectIdPattern } from '@email-system/core/utils'

const emailSchema = {
  body: {
    type: 'object',
    required: ['recipients', 'subject'],
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
      },
      emailId: {
        type: 'string',
        pattern: mongooseObjectIdPattern.source,
        errorMessage: {
          pattern: 'Invalid emailId',
        },
      },
      threadId: {
        type: 'string',
        pattern: mongooseObjectIdPattern.source,
        errorMessage: {
          pattern: 'Invalid threadId',
        },
      },
    },

    errorMessage: {
      type: 'Missing body.',
      required: {
        recipients: 'Recipient list is required',
        subject: 'Subject is required',
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
    required: ['emailId'],
    properties: {
      emailId: {
        type: 'string',
        pattern: mongooseObjectIdPattern.source,
        errorMessage: {
          pattern: 'Invalid email id.',
        },
      },
    },
    errorMessage: {
      required: {
        emailId: 'Missing parameter email id.',
      },
    },
  },
}
const patchMailSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    oneOf: [
      { required: ['isRead'] },
      { required: ['isStarred'] },
      {
        required: ['isDeleted'],
      },
    ],
    properties: {
      isRead: {
        type: 'boolean',
        errorMessage: {
          type: 'Invalid value for isRead.',
        },
      },
      isStarred: {
        type: 'boolean',
        errorMessage: {
          type: 'Invalid value for isStarred.',
        },
      },
      isDeleted: {
        type: 'boolean',
        errorMessage: {
          type: 'Invalid value for isDeleted.',
        },
      },
    },
    errorMessage: {
      oneOf: 'Exactly one of isRead, isStarred, or isDeleted must be provided.',
    },
  },
}
const attachmentDeleteSchema = {
  body: {
    type: 'object',
    required: ['attachments'],
    properties: {
      attachments: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
          pattern: mongooseObjectIdPattern.source,
          errorMessage: {
            pattern: 'Invalid attachment id',
          },
        },
        errorMessage: {
          type: 'Attachments must be an array',
          minItems: 'Please provide at least one attachment id',
        },
      },
    },
    errorMessage: {
      required: "Attachment id's array is required ",
    },
  },
}

export {
  emailSchema,
  attachmentSchema,
  patchMailSchema,
  attachmentDeleteSchema,
}
