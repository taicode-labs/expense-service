import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import fastifyPlugin from 'fastify-plugin'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'

import { ErrorResponse } from '@helpers/error'
import { createNotImplementedResponse, createResponse } from '@helpers/response'

export function createResponseHandler(): FastifyPluginAsync {
  return fastifyPlugin(async function plugin(app: FastifyInstance) {
    // 404
    app.setNotFoundHandler(async (request) => {
      throw createNotImplementedResponse(request.url)
    })

    app.setErrorHandler((error, _request, reply) => {
      if (ErrorResponse.is(error)) {
        reply.code(200).send(createResponse(error.type, null, error.message))
        if (error.parent != null) console.error(error.parent)
        console.log(error)
        return
      }

      // 处理数据库错误
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', null))
        return
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', null))
        return
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', null))
        return
      }

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', null))
        return
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', null))
        return
      }

      // 输入校验错误
      if (error.validation && error.validation.length > 0) {
        // TODO：验证的详细错误信息通过 message 返回
        reply.code(200).send(createResponse('INVALID_INPUT', null, error.message))
        return
      }

      if (error instanceof ZodError) {
        reply.code(200).send(createResponse('INVALID_INPUT', null, error.message))
        return
      }

      // 未知错误
      reply.code(200).send(createResponse('UNKNOWN_ERROR', null))
      return
    })
  })
}
