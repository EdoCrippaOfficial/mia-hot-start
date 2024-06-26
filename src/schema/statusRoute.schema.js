'use strict'

module.exports = {
  hide: true,
  response: {
    200: {
      type: 'object',
      additionalProperties: true,
      properties: {
        name: {
          type: 'string',
          description: 'The name of the current service that has responded',
        },
        status: {
          type: 'string',
          description: 'It\'s status, it must be OK',
          enum: ['OK'],
        },
        version: {
          type: 'string',
          description: 'The version of the service that is running expressed as semver',
        },
      },
      required: ['name', 'status', 'version'],
    },
    503: {
      type: 'object',
      additionalProperties: true,
      properties: {
        name: {
          type: 'string',
          description: 'The name of the current service that has responded',
        },
        status: {
          type: 'string',
          description: 'It\'s status, it must be KO',
          enum: ['KO'],
        },
        version: {
          type: 'string',
          description: 'The version of the service that is running expressed as semver',
        },
        message: {
          type: 'string',
          description: 'An optional message with an explanation of the KO response',
        },
      },
      required: ['name', 'status', 'version'],
    },
  },
}
