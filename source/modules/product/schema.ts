import z from 'zod'
import { listResponseSchema, responseSchema, routerSchema } from '@helpers/schema'

export const ProductSchema = z.object({
  id: z.string(),
  key: z.string().regex(/^[a-z-]+$/),
  name: z.string(),
  description: z.string(),
  createdTime: z.string(),
  updatedTime: z.string(),
  disabledTime: z.string().optional()
})

export type Product = z.TypeOf<typeof ProductSchema>

export const ProductFilterSchema = z.object({
  key: ProductSchema.shape.key.optional(),
  name: ProductSchema.shape.name.optional(),
})

export const ProductKeyInPathSchema = z.object({
  productKey: ProductSchema.shape.key
})

export const CreateProductBodySchema = z.object({
  name: ProductSchema.shape.name,
  description: ProductSchema.shape.description
})

export type CreateProductBody = z.TypeOf<typeof CreateProductBodySchema>
export const CreateProductResponseSchema = responseSchema(ProductSchema)
export type CreateProductResponse = z.TypeOf<typeof CreateProductResponseSchema['2XX']>

export const CreateProductSchema = routerSchema({
  operationId: 'createProduct',
  body: CreateProductBodySchema,
  params: ProductKeyInPathSchema,
  response: CreateProductResponseSchema
})

export const UpdateProductBodySchema = z.object({
  name: ProductSchema.shape.name,
  description: ProductSchema.shape.description
})

export type UpdateProductBody = z.TypeOf<typeof UpdateProductBodySchema>
export const UpdateProductResponseSchema = responseSchema(ProductSchema)
export type UpdateProductResponse = z.TypeOf<typeof UpdateProductResponseSchema['2XX']>

export const UpdateProductSchema = routerSchema({
  operationId: 'updateProduct',
  body: UpdateProductBodySchema,
  params: ProductKeyInPathSchema,
  response: UpdateProductResponseSchema
})

export const ListProductBodySchema = z.null()
export type ListProductBody = z.TypeOf<typeof ListProductBodySchema>

export const ListProductResponseSchema = listResponseSchema(ProductSchema)
export type ListProductResponse = z.TypeOf<typeof ListProductResponseSchema['2XX']>

export const ListProductSchema = routerSchema({
  operationId: 'listProduct',
  body: ListProductBodySchema,
  response: ListProductResponseSchema
})

export const GetProductParamsSchema = z.object({
  productKey: ProductSchema.shape.key,
})

export const GetProductBodySchema = z.null()
export type getProductBody = z.TypeOf<typeof GetProductBodySchema>
export const GetProductResponseSchema = responseSchema(ProductSchema)
export type GetProductResponse = z.TypeOf<typeof GetProductResponseSchema['2XX']>

export const GetProductSchema = routerSchema({
  operationId: 'getProduct',
  body: GetProductBodySchema,
  params: GetProductParamsSchema,
  response: GetProductResponseSchema
})
