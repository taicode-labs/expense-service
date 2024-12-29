import z from 'zod'
import { listResponseSchema, responseSchema, routerSchema } from '@helpers/schema'

export const BillingItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  price: z.number(),
  productKey: z.string(),
  description: z.string(),
  createdTime: z.string(),
  updatedTime: z.string(),
  disabledTime: z.string().optional()
})

export type BillingItem = z.TypeOf<typeof BillingItemSchema>

export const BillingItemFilterSchema = z.object({
  name: BillingItemSchema.shape.name
})

export const BillingItemIdInPathSchema = z.object({
  itemKey: BillingItemSchema.shape.key,
})

export const CreateBillingItemBodySchema = z.object({
  name: BillingItemSchema.shape.name,
  price: BillingItemSchema.shape.price,
  productKey: BillingItemSchema.shape.productKey,
  description: BillingItemSchema.shape.description
})

export type CreateBillingItemBody = z.TypeOf<typeof CreateBillingItemBodySchema>
export const CreateBillingItemResponseSchema = responseSchema(BillingItemSchema)
export type CreateBillingItemResponse = z.TypeOf<typeof CreateBillingItemResponseSchema['2XX']>

export const CreateBillingItemSchema = routerSchema({
  operationId: 'createBillingItem',
  body: CreateBillingItemBodySchema,
  params: BillingItemIdInPathSchema,
  response: CreateBillingItemResponseSchema
})

export const UpdateBillingItemBodySchema = z.object({
  name: BillingItemSchema.shape.name.optional(),
  price: BillingItemSchema.shape.price.optional(),
  description: BillingItemSchema.shape.description.optional()
})

export type UpdateBillingItemBody = z.TypeOf<typeof UpdateBillingItemBodySchema>
export const UpdateBillingItemResponseSchema = responseSchema(BillingItemSchema)
export type UpdateBillingItemResponse = z.TypeOf<typeof UpdateBillingItemResponseSchema['2XX']>

export const UpdateBillingItemSchema = routerSchema({
  operationId: 'updateBillingItem',
  body: UpdateBillingItemBodySchema,
  params: BillingItemIdInPathSchema,
  response: UpdateBillingItemResponseSchema
})

export const ListBillingItemBodySchema = z.null()
export type ListBillingItemBody = z.TypeOf<typeof ListBillingItemBodySchema>

export const ListBillingItemResponseSchema = listResponseSchema(BillingItemSchema)
export type ListBillingItemResponse = z.TypeOf<typeof ListBillingItemResponseSchema['2XX']>

export const ListBillingItemSchema = routerSchema({
  operationId: 'listBillingItem',
  body: ListBillingItemBodySchema,
  response: ListBillingItemResponseSchema
})

export const GetBillingItemParamsSchema = z.object({
  itemKey: BillingItemSchema.shape.key
})

export const GetBillingItemBodySchema = z.null()
export type getBillingItemBody = z.TypeOf<typeof GetBillingItemBodySchema>
export const GetBillingItemResponseSchema = responseSchema(BillingItemSchema)
export type GetBillingItemResponse = z.TypeOf<typeof GetBillingItemResponseSchema['2XX']>

export const GetBillingItemSchema = routerSchema({
  operationId: 'getBillingItem',
  body: GetBillingItemBodySchema,
  params: GetBillingItemParamsSchema,
  response: GetBillingItemResponseSchema
})
