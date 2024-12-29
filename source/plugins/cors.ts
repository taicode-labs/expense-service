import cors from '@fastify/cors'
import fastifyPlugin from 'fastify-plugin'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'

export function createCors(): FastifyPluginAsync {
  return fastifyPlugin(async function plugin(app: FastifyInstance) {
    app.register(cors, { origin: true, credentials: true })
  })
}
