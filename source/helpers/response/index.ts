import { ErrorType } from '@helpers/error'
import { ErrorResponse } from '@helpers/schema'

type ResponseStatus = ErrorType | 'SUCCESS'

export function createResponse<S extends ResponseStatus, T>(status: S, data: T, message: string = '') {
  if (status !== 'SUCCESS') return { status, message } satisfies ErrorResponse
  return { data, status, message }
}

export function createSuccessResponse<T>(data: T) {
  return createResponse('SUCCESS', data)
}

export function createNotImplementedResponse(name: string) {
  return createResponse('NOT_IMPLEMENTED', undefined, `${name} is not implemented`)
}
