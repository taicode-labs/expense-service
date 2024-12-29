import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { BillingUsageService } from '@modules/billing/usage'
import { BillingItemService } from '@modules/billing/item'
import { createSuccessResponse } from '@helpers/response'

import * as s from './schema'

interface BillingUsageOptions {
  billingItemService: BillingItemService
  billingUsageService: BillingUsageService
}

export function createBillingUsageRouter(options: BillingUsageOptions): FastifyPluginAsync {
  const { billingUsageService, billingItemService } = options

  return async (app) => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()

    typedApp.post('/billing/usage/report/:itemKey', { schema: s.BillingUsageReportSchema }, async request => {
      const userId = request.user.id
      const { itemKey } = request.params
      await billingItemService.getBillingItemByKey(itemKey)
      await billingUsageService.createBillingUsage(userId, itemKey, request.body)
      return createSuccessResponse(true)
    })

    typedApp.post('/billing/usage/remaining/get/:itemKey', { schema: s.GetBillingUsageRemainingSchema }, async request => {
      const userId = request.user.id
      const { itemKey } = request.params
      await billingItemService.getBillingItemByKey(itemKey)
      return createSuccessResponse({ userId, itemKey, quantity: 9999 })
    })

    typedApp.post('/billing/usage/statistic/get/:itemKey', { schema: s.GetBillingUsageStatisticSchema }, async request => {
      const userId = request.user.id
      const { itemKey } = request.params
      await billingItemService.getBillingItemByKey(itemKey)
      const result = await billingUsageService.getBillingUsageStatistic(userId, itemKey, request.body)
      return createSuccessResponse(result)
    })

    typedApp.post('/billing/usage/statistic/get/:userId/:itemKey', { schema: s.GetAnyUserBillingUsageStatisticSchema }, async request => {
      const { itemKey, userId } = request.params
      await billingItemService.getBillingItemByKey(itemKey)
      const result = await billingUsageService.getBillingUsageStatistic(userId, itemKey, request.body)
      return createSuccessResponse(result)
    })
  }
}
