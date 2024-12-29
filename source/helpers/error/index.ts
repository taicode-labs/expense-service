import { z } from 'zod'
import { ModelResponse as AMR } from 'clients/account'

export const OutsideServiceErrors = [
  // account
  'UNKNOWN_ERROR',
  'INVALID_INPUT',
  'INCORRECT_PASSWORD',
  'AUTH_FAILED',
  'INVALID_TOKEN',
  'AUTH_TOKEN_EXPIRED',
  'CROSS_AUTH_TICKET_NOT_EXISTS',
  'PROHIBITED_BY_PERMISSION',
  'PERMISSION_ROLE_NOT_EXISTS',
  'USER_NOT_EXISTS',
  'USER_ALREADY_EXISTS',
  'USER_SETTING_NOT_FOUND',
  'USER_SECRET_NOT_FOUND',
  'NOT_IMPLEMENTED',
] satisfies AMR['errorTypes'][]

export const ServiceErrors = [
  'INIT_CONFIG_FAILED',
  'UNKNOWN_ERROR',
  'INVALID_INPUT',
  'PRODUCT_NOT_FOUND',
  'NOT_IMPLEMENTED',
  'BILLING_ITEM_ALREADY_EXISTS',
  'BILLING_ITEM_NOT_FOUND',
] as const

export const ErrorTypeSchema = z.enum([...ServiceErrors, ...OutsideServiceErrors])

export type ErrorType = z.TypeOf<typeof ErrorTypeSchema>

export class ErrorResponse extends Error {
  public parent: unknown = null
  constructor(public type: ErrorType, message?: string) {
    super(message)
  }

  static is(error: unknown): error is ErrorResponse {
    return error instanceof ErrorResponse
  }
}

export class UnknownErrorResponse extends ErrorResponse {
  constructor(error: unknown) {
    super('UNKNOWN_ERROR', error instanceof Error ? error.message : String(error))
    this.parent = error
  }
}
