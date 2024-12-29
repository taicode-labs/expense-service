import { Prisma, PrismaClient } from '@prisma/client'

import { ErrorResponse, UnknownErrorResponse } from '@helpers/error'
import { catchP } from '@helpers/catch'

import * as s from './schema'

export type BillingItemService = ReturnType<typeof createBillingItemService>

export function createBillingItemService(db: PrismaClient) {
  function toPlain<T extends Prisma.BillingItemGetPayload<undefined>>(model: T): s.BillingItem {
    return {
      id: model.id,
      key: model.key,
      name: model.name,
      price: model.price,
      productKey: model.productKey,
      description: model.description,
      createdTime: model.createdTime.toISOString(),
      updatedTime: model.updatedTime.toISOString(),
      disabledTime: model.disabledTime?.toISOString(),
    }
  }

  function toPlains<T extends Prisma.BillingItemGetPayload<undefined>>(models: T[]): s.BillingItem[] {
    return models.map(model => toPlain(model))
  }

  /** 过滤掉已经禁用的 */
  function getDisabledFilter(includeDisabled: boolean = false) {
    // 默认不包含已删除的
    if (includeDisabled) return {}

    return {
      OR: [
        { disabledTime: { equals: null } },
        { disabledTime: { gt: new Date() } }
      ]
    }
  }

  async function createBillingItem(itemKey: string, data: s.CreateBillingItemBody) {
    const { name, price, productKey, description } = data
    const [billingItem, error] = await catchP(db.billingItem.create({
      data: { key: itemKey, name, price, productKey, description }
    }))

    if (error != null) throw new UnknownErrorResponse(error)
    return getBillingItemByKey(billingItem.id)
  }

  async function updateBillingItem(itemKey: string, data: s.UpdateBillingItemBody) {
    await getBillingItemByKey(itemKey)
    const { name, description, price } = data

    const [billingItem, error] = await catchP(db.billingItem.update({
      where: { key: itemKey },
      data: { name, description, price }
    }))

    if (error != null) throw new UnknownErrorResponse(error)
    return getBillingItemByKey(billingItem.id)
  }

  async function listBillingItem() {
    const [result, error] = await catchP(db.billingItem.findMany({
      where: { ...getDisabledFilter() },
      orderBy: { createdTime: 'desc' }
    }))

    if (error == null && result != null) return result
    throw new UnknownErrorResponse(error)
  }

  async function getBillingItemByKey(itemKey: string,) {
    const [billingItem, error1] = await catchP(db.billingItem.findFirst({
      where: { key: itemKey, ...getDisabledFilter() }
    }))

    if (error1 != null) new UnknownErrorResponse(error1)
    if (billingItem == null) throw new ErrorResponse('BILLING_ITEM_NOT_FOUND')
    return billingItem
  }

  /** 服务健康检查 */
  async function health(): Promise<boolean> {
    const [result, error] = await catchP(db.billingItem.count({
      take: 1,
      skip: 0
    }))

    return error == null && typeof result === 'number'
  }

  return {
    health,
    toPlain,
    toPlains,
    listBillingItem,
    updateBillingItem,
    createBillingItem,
    getBillingItemByKey,
  }
}
