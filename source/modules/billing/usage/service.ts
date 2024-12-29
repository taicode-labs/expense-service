import { Prisma, PrismaClient } from '@prisma/client'
import { getBillingUsageStatistic as getBillingUsageStatisticSql } from '@prisma/client/sql'

import { UnknownErrorResponse } from '@helpers/error'
import { bigintToNumber } from '@helpers/bigint'
import { catchP } from '@helpers/catch'

import * as s from './schema'
import dayjs from 'dayjs'

export type BillingUsageService = ReturnType<typeof createBillingUsageService>

export function createBillingUsageService(db: PrismaClient) {
  function toPlain<T extends Prisma.BillingUsageGetPayload<undefined>>(model: T): s.BillingUsage {
    return {
      id: model.id,
      userId: model.userId,
      itemKey: model.itemKey,
      quantity: model.quantity,
      createdTime: model.createdTime.toISOString(),
      consumptionTime: model.consumptionTime.toISOString(),
    }
  }

  function toPlains<T extends Prisma.BillingUsageGetPayload<undefined>>(models: T[]): s.BillingUsage[] {
    return models.map(model => toPlain(model))
  }

  async function createBillingUsage(userId: string, itemKey: string, data: s.ReportBillingUsageBody) {
    const dataList = Array.isArray(data) ? data : [data]
    const [billingUsage, error] = await catchP(db.billingUsage.createMany({
      data: dataList.map(({ quantity, consumptionTime }) => (
        { userId, itemKey, quantity, consumptionTime }
      ))
    }))

    if (error != null) throw new UnknownErrorResponse(error)
    return billingUsage
  }

  async function getBillingUsageStatistic(userId: string, itemKey: string, data: s.GetAnyUserBillingUsageStatisticBody) {
    const { startTime, endTime, stepInterval } = data
    const sql = getBillingUsageStatisticSql(
      dayjs(startTime).toDate(),
      dayjs(endTime).toDate(),
      stepInterval,
      userId,
      itemKey
    )
    const [result, error] = await catchP(db.$queryRawTyped(sql))
    if (error != null) throw new UnknownErrorResponse(error)
    return result.map(row => {
      const { quantity, consumptionTime } = row
      return {
        quantity: bigintToNumber(quantity),
        consumptionTime: consumptionTime!.toISOString()
      }
    })
  }

  /** 服务健康检查 */
  async function health(): Promise<boolean> {
    const [result, error] = await catchP(db.billingUsage.count({
      take: 1,
      skip: 0
    }))

    return error == null && typeof result === 'number'
  }

  return {
    health,
    toPlain,
    toPlains,
    createBillingUsage,
    getBillingUsageStatistic
  }
}
