'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const fastify = require('fastify')
const fastifyMia = require('../../src')

async function setupFastify({ disableMetrics = false } = {}) {
  const server = fastify()
  server.register(fastifyMia, {
    envSchema: { type: 'object' },
    disableMetrics,
  })

  return server
}

describe('Fastify Metrics', () => {
  it('has correctly registered the plugin', async() => {
    const fastifyInstance = await setupFastify()
    assert.ok(fastifyInstance.hasPlugin('fastify-metrics'), `The plugin fastify-metrics is not registered correctly`)
  })

  it('has correctly exposed the metrics route', async() => {
    const fastifyInstance = await setupFastify()

    fastifyInstance.get('/test', async(request, reply) => {
      reply.send('ok')
    })

    await fastifyInstance.inject({
      method: 'GET',
      url: '/test',
    })

    const response = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/metrics',
    })

    assert.equal(response.statusCode, 200)

    const lines = response.payload.split('\n')
    assert.ok(
      lines.includes('http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1'),
      `The metrics for the route /test are not correctly registered`
    )
  })

  it('has correctly skipped the plugin if the option `disableMetrics` is true', async() => {
    const fastifyInstance = await setupFastify({
      disableMetrics: true,
    })
    assert.ok(!fastifyInstance.hasPlugin('fastify-metrics'), `The plugin fastify-metrics is not skipped`)
  })

  it('lets you define a custom metric', async() => {
    const fastifyInstance = await setupFastify()

    const promClient = fastifyInstance.metrics.client
    const customMetric = new promClient.Counter({
      name: 'custom_metric',
      help: 'This is a custom metric',
      labelNames: ['foo'],
    })

    customMetric.labels({ foo: 'bar' }).inc(10)

    const response = await fastifyInstance.inject({
      method: 'GET',
      url: '/-/metrics',
    })

    const lines = response.payload.split('\n')
    assert.ok(
      lines.includes('custom_metric{foo="bar"} 10'),
      `The custom metric is not registered correctly`
    )
  })
})
