'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const fastify = require('fastify')
const fastifyMia = require('../../src')

async function setupFastify({
  customReadyRouteHandler,
  customHealthzRouteHandler,
  customCheckUpRouteHandler,
  disableStatusRoutes,
} = {}) {
  const server = fastify()
  server.register(fastifyMia, {
    envSchema: { type: 'object' },
    customReadyRouteHandler,
    customHealthzRouteHandler,
    customCheckUpRouteHandler,
    disableStatusRoutes,
  })

  return server
}

describe('Status Routes', () => {
  it('has correctly registered the routes with default handlers', async() => {
    const fastifyInstance = await setupFastify()

    const readyResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/ready',
    })
    const healthzResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/healthz',
    })
    const checkUpResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/check-up',
    })

    assert.equal(readyResponse.statusCode, 200, `The ready response code is not the one expected`)
    assert.equal(healthzResponse.statusCode, 200, `The healthz response code is not the one expected`)
    assert.equal(checkUpResponse.statusCode, 200, `The checkup response code is not the one expected`)

    assert.equal(JSON.parse(readyResponse.payload).status, 'OK', `The ready response is not the one expected`)
    assert.equal(JSON.parse(healthzResponse.payload).status, 'OK', `The healthz response is not the one expected`)
    assert.equal(JSON.parse(checkUpResponse.payload).status, 'OK', `The checkup response is not the one expected`)
  })

  it('has correctly registered the routes with default handlers and no npm_package_ envs', async() => {
    delete process.env.npm_package_name
    delete process.env.npm_package_version

    const fastifyInstance = await setupFastify()

    const readyResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/ready',
    })
    const healthzResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/healthz',
    })
    const checkUpResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/check-up',
    })

    assert.equal(readyResponse.statusCode, 200, `The ready response code is not the one expected`)
    assert.equal(healthzResponse.statusCode, 200, `The healthz response code is not the one expected`)
    assert.equal(checkUpResponse.statusCode, 200, `The checkup response code is not the one expected`)

    assert.equal(JSON.parse(readyResponse.payload).status, 'OK', `The ready response is not the one expected`)
    assert.equal(JSON.parse(healthzResponse.payload).status, 'OK', `The healthz response is not the one expected`)
    assert.equal(JSON.parse(checkUpResponse.payload).status, 'OK', `The checkup response is not the one expected`)
  })

  it('has correctly registered the routes with custom handlers', async() => {
    const customReadyRouteHandler = async(request, reply) => {
      reply.send({ name: 'test', status: 'OK', version: '1.0.0', custom: 'Custom Ready' })
    }
    const customHealthzRouteHandler = async(request, reply) => {
      reply.send({ name: 'test', status: 'OK', version: '1.0.0', custom: 'Custom Healthz' })
    }
    const customCheckUpRouteHandler = async(request, reply) => {
      reply.send({ name: 'test', status: 'OK', version: '1.0.0', custom: 'Custom Check Up' })
    }
    const fastifyInstance = await setupFastify({
      customReadyRouteHandler,
      customHealthzRouteHandler,
      customCheckUpRouteHandler,
    })

    const readyResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/ready',
    })
    const healthzResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/healthz',
    })
    const checkUpResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/check-up',
    })

    assert.equal(readyResponse.statusCode, 200, `The ready response code is not the one expected`)
    assert.equal(healthzResponse.statusCode, 200, `The healthz response code is not the one expected`)
    assert.equal(checkUpResponse.statusCode, 200, `The checkup response code is not the one expected`)

    assert.equal(JSON.parse(readyResponse.payload).custom, 'Custom Ready', `The ready response is not the one expected`)
    assert.equal(JSON.parse(healthzResponse.payload).custom, 'Custom Healthz', `The healthz response is not the one expected`)
    assert.equal(JSON.parse(checkUpResponse.payload).custom, 'Custom Check Up', `The checkup response is not the one expected`)
  })

  it('has correctly skipped the plugin if the option `disableStatusRoutes` is true', async() => {
    const fastifyInstance = await setupFastify({
      disableStatusRoutes: true,
    })

    const readyResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/ready',
    })
    const healthzResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/healthz',
    })
    const checkUpResponse = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/check-up',
    })

    assert.equal(readyResponse.statusCode, 404, `The ready response code is not the one expected`)
    assert.equal(healthzResponse.statusCode, 404, `The healthz response code is not the one expected`)
    assert.equal(checkUpResponse.statusCode, 404, `The checkup response code is not the one expected`)
  })

  it('should leave the log level if is `silent`', async() => {
    const server = fastify({ logger: true })

    const routes = []
    server.addHook('onRoute', route => {
      routes.push(route)
    })

    server.register(fastifyMia, {
      envSchema: {
        type: 'object',
        properties: {
          LOG_LEVEL: { type: 'string', default: 'silent' },
        },
      },
      logLevelEnvKey: 'LOG_LEVEL',
    })

    await server.ready()

    const readyRoute = routes.find(route => route.url === '/-/ready' && route.method === 'GET')
    assert.equal(readyRoute.logLevel, 'silent', `The ready route logLevel is not the one expected`)
  })
  it('should use the log level `error` if is different from `silent`', async() => {
    const server = fastify({ logger: true })

    const routes = []
    server.addHook('onRoute', route => {
      routes.push(route)
    })

    server.register(fastifyMia, {
      envSchema: {
        type: 'object',
        properties: {
          LOG_LEVEL: { type: 'string', default: 'trace' },
        },
      },
      logLevelEnvKey: 'LOG_LEVEL',
    })

    await server.ready()

    const readyRoute = routes.find(route => route.url === '/-/ready' && route.method === 'GET')
    assert.equal(readyRoute.logLevel, 'error', `The ready route logLevel is not the one expected`)
  })
})
