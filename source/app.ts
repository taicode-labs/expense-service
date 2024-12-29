import Fastify from 'fastify'

import { PrismaClient } from '@prisma/client'

import { initClients } from 'clients'
import { config } from '@helpers/config'
import { createCors } from '@plugins/cors'
import { createAuth } from '@plugins/auth'
import { createOpenapi } from '@plugins/openapi'
import { createGlobalRouter } from '@modules/global'
import { createResponseHandler } from '@plugins/response'
import { createProductRouter, createProductService } from '@modules/product'
import { createBillingItemRouter, createBillingItemService } from '@modules/billing/item'
import { createBillingUsageRouter, createBillingUsageService } from '@modules/billing/usage'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'

export async function createApp() {
  await initClients()

  const fastify = Fastify({ logger: config.debug })
  const db = new PrismaClient({ datasourceUrl: config.datasourceUrl })

  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  fastify.register(createAuth())
  fastify.register(createCors())
  fastify.register(createOpenapi())
  fastify.register(createResponseHandler())

  const productService = createProductService(db)
  const billingItemService = createBillingItemService(db)
  const billingUsageService = createBillingUsageService(db)
  const services = { billingItemService, billingUsageService, productService }

  fastify.register(createProductRouter(services))
  fastify.register(createBillingItemRouter(services))
  fastify.register(createBillingUsageRouter(services))
  fastify.register(createGlobalRouter({ services: Object.values(services) }))

  await fastify.ready()
  return fastify
}
