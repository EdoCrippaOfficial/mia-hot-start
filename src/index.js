'use strict'

const fp = require('fastify-plugin')

const pluginName = 'fastify-mia-hot-start'

const {
  registerEnvs,
  registerSwagger,
  registerLogger,
  registerMetrics,
  registerStatus,
  registerShutdown,
  registerFormBody,
  registerPlatformDecorators,
  registerHttpClient,
} = require('./lib')

const {
  mergeUserOptionsWithDefaults,
} = require('./config')

async function plugin(fastify, userOptions) {
  const opts = mergeUserOptionsWithDefaults(userOptions)

  await registerEnvs(fastify, opts)
  await registerSwagger(fastify, opts)
  await registerLogger(fastify, opts)
  await registerMetrics(fastify, opts)
  await registerStatus(fastify, opts)
  await registerShutdown(fastify, opts)
  await registerFormBody(fastify, opts)
  await registerPlatformDecorators(fastify, opts)
  await registerHttpClient(fastify, opts)
}

module.exports = fp(plugin, {
  fastify: '4.x',
  name: pluginName,
})

module.exports.pluginName = pluginName
