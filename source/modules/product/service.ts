import { Prisma, PrismaClient } from '@prisma/client'

import { ErrorResponse, UnknownErrorResponse } from '@helpers/error'
import { catchP } from '@helpers/catch'

import * as s from './schema'

export type ProductService = ReturnType<typeof createProductService>

export function createProductService(db: PrismaClient) {
  function toPlain<T extends Prisma.ProductGetPayload<undefined>>(model: T): s.Product {
    return {
      id: model.id,
      key: model.key,
      name: model.name,
      description: model.description,
      createdTime: model.createdTime.toISOString(),
      updatedTime: model.updatedTime.toISOString(),
      disabledTime: model.disabledTime?.toISOString(),
    }
  }

  function toPlains<T extends Prisma.ProductGetPayload<undefined>>(models: T[]): s.Product[] {
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

  async function createProduct(productKey: string, data: s.CreateProductBody) {
    const key = productKey
    const { name, description } = data
    const [product, error] = await catchP(db.product.create({
      data: { key, name, description }
    }))

    if (error != null) throw new UnknownErrorResponse(error)
    return getProductByKey(product.key)
  }

  async function updateProduct(productKey: string, data: s.UpdateProductBody) {
    await getProductByKey(productKey)
    const { name, description } = data
    const [product, error] = await catchP(db.product.update({
      data: { name, description },
      where: { key: productKey },
    }))

    if (error != null) throw new UnknownErrorResponse(error)
    return getProductByKey(product.key)
  }

  async function listProduct() {
    const [result, error] = await catchP(db.product.findMany({
      where: { ...getDisabledFilter() },
      orderBy: { createdTime: 'desc' }
    }))

    if (error == null && result != null) return result
    throw new UnknownErrorResponse(error)
  }

  async function getProductByKey(productKey: string) {
    const [product, error1] = await catchP(db.product.findFirst({
      where: { key: productKey, ...getDisabledFilter() }
    }))

    if (error1 != null) new UnknownErrorResponse(error1)
    if (product == null) throw new ErrorResponse('PRODUCT_NOT_FOUND')
    return product
  }

  /** 服务健康检查 */
  async function health(): Promise<boolean> {
    const [result, error] = await catchP(db.product.count({
      take: 1,
      skip: 0
    }))

    return error == null && typeof result === 'number'
  }

  return {
    health,
    toPlain,
    toPlains,
    listProduct,
    updateProduct,
    createProduct,
    getProductByKey,
  }
}
