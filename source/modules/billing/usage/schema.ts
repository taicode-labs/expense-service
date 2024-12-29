import z from 'zod'
import { responseSchema, routerSchema } from '@helpers/schema'

export const BillingUsageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  itemKey: z.string(),
  quantity: z.number(),
  metadata: z.unknown(),
  createdTime: z.string(),
  consumptionTime: z.string()
})

export type BillingUsage = z.TypeOf<typeof BillingUsageSchema>

export const ReportBillingUsagePramsSchema = z.object({
  itemKey: z.string()
})

const ReportBillingUsageItemSchema = z.object({
  quantity: BillingUsageSchema.shape.quantity,
  metadata: BillingUsageSchema.shape.metadata.optional(),
  consumptionTime: BillingUsageSchema.shape.consumptionTime.optional(),
})

export const ReportBillingUsageBodySchema = ReportBillingUsageItemSchema
  .or(z.array(ReportBillingUsageItemSchema))

export type ReportBillingUsageBody = z.TypeOf<typeof ReportBillingUsageBodySchema>
export const ReportBillingUsageResponseSchema = responseSchema(z.boolean())
export type ReportBillingUsageResponse = z.TypeOf<typeof ReportBillingUsageResponseSchema['2XX']>

export const BillingUsageReportSchema = routerSchema({
  operationId: 'reportBillingUsage',
  body: ReportBillingUsageBodySchema,
  params: ReportBillingUsagePramsSchema,
  response: ReportBillingUsageResponseSchema
})

export const GetBillingUsageRemainingPramsSchema = z.object({
  itemKey: z.string()
})

export const GetBillingUsageRemainingBodySchema = z.null()
export const GetBillingUsageRemainingResponseSchema = responseSchema(z.object({
  userId: z.string(),
  itemKey: z.string(),
  quantity: z.number()
}))

export type GetBillingUsageRemainingResponse = z.TypeOf<typeof GetBillingUsageRemainingResponseSchema['2XX']>

export const GetBillingUsageRemainingSchema = routerSchema({
  operationId: 'getBillingUsageRemaining',
  body: GetBillingUsageRemainingBodySchema,
  params: GetBillingUsageRemainingPramsSchema,
  response: GetBillingUsageRemainingResponseSchema
})

export const GetAnyUserBillingUsageStatisticPramsSchema = z.object({
  userId: z.string(),
  itemKey: z.string(),
})

export const GetAnyUserBillingUsageStatisticBodySchema = z.object({
  endTime: z.string(),
  startTime: z.string(),
  stepInterval: z.enum(['15 minutes', '1 hour', '1 day', '1 week', '1 month']).default('1 hour'),
})
export type GetAnyUserBillingUsageStatisticBody = z.TypeOf<typeof GetAnyUserBillingUsageStatisticBodySchema>
export const GetAnyUserBillingUsageStatisticResponseSchema = responseSchema(z.array(z.object({
  quantity: z.number(),
  consumptionTime: z.string(),
})))

export type GetAnyUserBillingUsageStatisticResponse = z.TypeOf<typeof GetAnyUserBillingUsageStatisticResponseSchema['2XX']>

export const GetAnyUserBillingUsageStatisticSchema = routerSchema({
  operationId: 'getAnyUserBillingUsageStatistic',
  body: GetAnyUserBillingUsageStatisticBodySchema,
  params: GetAnyUserBillingUsageStatisticPramsSchema,
  response: GetAnyUserBillingUsageStatisticResponseSchema
})

export const GetBillingUsageStatisticPramsSchema = z.object({
  itemKey: z.string(),
})

export const GetBillingUsageStatisticSchema = routerSchema({
  operationId: 'getBillingUsageStatistic',
  params: GetBillingUsageStatisticPramsSchema,
  body: GetAnyUserBillingUsageStatisticBodySchema,
  response: GetAnyUserBillingUsageStatisticResponseSchema
})
