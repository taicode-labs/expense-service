import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { ProductService } from '@modules/product'
import { createSuccessResponse } from '@helpers/response'

import * as s from './schema'

interface ProductOptions {
  productService: ProductService
}

export function createProductRouter(options: ProductOptions): FastifyPluginAsync {
  const { productService } = options

  return async (app) => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()

    typedApp.post('/product/list', { schema: s.ListProductSchema }, async () => {
      const result = await productService.listProduct()
      return createSuccessResponse({ total: result.length, list: productService.toPlains(result) })
    })

    // 创建指定产品的指定版本 product
    typedApp.post('/product/create/:productKey', { schema: s.CreateProductSchema }, async request => {
      const { productKey } = request.params
      const { name, description } = request.body
      const result = await productService.createProduct(productKey, { name, description })
      return createSuccessResponse(productService.toPlain(result))
    })

    // 更新指定产品的指定版本 product
    typedApp.post('/product/update/:productKey', { schema: s.UpdateProductSchema }, async request => {
      const { productKey } = request.params
      const { name, description } = request.body
      const result = await productService.updateProduct(productKey, { name, description })
      return createSuccessResponse(productService.toPlain(result))
    })

    // 获取指定产品的指定版本 product 信息
    typedApp.post('/product/get/:productKey', { schema: s.GetProductSchema }, async request => {
      const { productKey: productId } = request.params
      const result = await productService.getProductByKey(productId)
      return createSuccessResponse(productService.toPlain(result))
    })
  }
}
