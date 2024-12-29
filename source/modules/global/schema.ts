import { z } from 'zod'
import { ErrorTypeSchema } from '@helpers/error'
import { responseSchema, routerSchema } from '@helpers/schema'
import { ProductSchema } from '@modules/product/schema'
import { BillingItemSchema } from '@modules/billing/item/schema'
import { BillingUsageSchema } from '@modules/billing/usage/schema'

export const ModelResponseSchema = z.object({
  product: ProductSchema,
  errorTypes: ErrorTypeSchema,
  billingItem: BillingItemSchema,
  billingUsage: BillingUsageSchema,
  response: responseSchema(z.unknown())['2XX']
}).describe('系统中所有的数据模型')

export const ModelSchema = routerSchema({
  operationId: 'model',
  response: { 200: ModelResponseSchema }
})
