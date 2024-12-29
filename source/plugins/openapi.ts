import OpenApi from '@fastify/swagger'
import fastifyPlugin from 'fastify-plugin'
import ApiReference from '@scalar/fastify-api-reference'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { createJsonSchemaTransform } from 'fastify-type-provider-zod'

import { config } from '@helpers/config'

export function createOpenapi(): FastifyPluginAsync {
  return fastifyPlugin(async function plugin(app: FastifyInstance) {
    const schemaTransform = createJsonSchemaTransform({ skipList: [] })

    await app.register(OpenApi, {
      transform: ({ schema, url }) => {
        const openApiSchema = schemaTransform({ schema, url })
        const [, root, module] = openApiSchema.url.split('/')
        if (root && module) openApiSchema.schema.tags = [root]
        return openApiSchema
      },
      openapi: {
        openapi: '3.0.0',
        info: {
          version: config.version,
          title: 'Taicode Account Service',
          description: 'Basic account services',
        },
        servers: [
          {
            url: config.serverUrl,
            description: 'Server URL'
          }
        ],
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer'
            }
          }
        }
      }
    })

    // Serve an OpenAPI file
    app.get('/openapi.json', { config: { auth: ['NoLoginRequired'] } }, async () => {
      return app.swagger()
    })

    await app.register(ApiReference, {
      routePrefix: '/reference',
    })

    app.addHook('onListen', () => {
      console.info(`Generated openapi.json ${config.serverUrl}/openapi.json`)
      console.info(`Generated api reference ${config.serverUrl}/reference`)
    })
  })
}
