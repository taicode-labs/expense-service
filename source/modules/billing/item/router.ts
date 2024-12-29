import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { ErrorResponse } from '@helpers/error'
import { ProductService } from '@modules/product'
import { BillingItemService } from '@modules/billing/item'
import { createSuccessResponse } from '@helpers/response'

import * as s from './schema'

interface BillingItemOptions {
  productService: ProductService
  billingItemService: BillingItemService
}

export function createBillingItemRouter(options: BillingItemOptions): FastifyPluginAsync {
  const { billingItemService, productService } = options

  return async (app) => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()

    typedApp.post('/billing/item/list', { schema: s.ListBillingItemSchema }, async () => {
      const result = await billingItemService.listBillingItem()
      return createSuccessResponse({ total: result.length, list: billingItemService.toPlains(result) })
    })

    typedApp.post('/billing/item/get/:itemKey', { schema: s.GetBillingItemSchema }, async request => {
      const { itemKey } = request.params
      const result = await billingItemService.getBillingItemByKey(itemKey)
      return createSuccessResponse(billingItemService.toPlain(result))
    })

    typedApp.post('/billing/item/create/:itemKey', { schema: s.CreateBillingItemSchema }, async request => {
      const { itemKey } = request.params
      const { name, price, productKey, description } = request.body

      await productService.getProductByKey(productKey)
      const item = await billingItemService.getBillingItemByKey(itemKey)
      if (item != null) throw new ErrorResponse('BILLING_ITEM_ALREADY_EXISTS')
      const result = await billingItemService.createBillingItem(itemKey, { name, price, productKey, description })
      return createSuccessResponse(billingItemService.toPlain(result))
    })

    typedApp.post('/billing/item/update/:itemKey', { schema: s.UpdateBillingItemSchema }, async request => {
      const { itemKey } = request.params
      const { name, price, description } = request.body
      const result = await billingItemService.updateBillingItem(itemKey, { name, price, description })
      return createSuccessResponse(billingItemService.toPlain(result))
    })
  }
}
