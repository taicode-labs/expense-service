import { fastifyPlugin } from 'fastify-plugin'
import { FastifyContextConfig, FastifyPluginAsync, FastifyRequest } from 'fastify'
import fastifyCookie from '@fastify/cookie'

import { catchP } from '@helpers/catch'
import { ErrorResponse, UnknownErrorResponse } from '@helpers/error'
import { getUser, ModelResponse, verifyPermission } from 'clients/account'

type User = ModelResponse['user']

declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }

  interface FastifyContextConfig {
    auth: Array<'NoLoginRequired' | 'IgnorePermission'>
  }
}

function getRouteAuthPath(url?: string): FastifyContextConfig['auth'] {
  /** 非特殊原因不要向此处添加任何路由 */
  const routeAuthPatch: Record<string, FastifyContextConfig['auth']> = {
    // 来自 @scalar/fastify-api-reference，暂时还没办法绕过
    '/reference': ['NoLoginRequired'],
  }

  if (url == '' || url == null) return []

  for (const path in routeAuthPatch) {
    if (url.startsWith(path)) {
      return routeAuthPatch[path]
    }
  }

  return []
}

export function createAuth(): FastifyPluginAsync {
  function getTokenFromRequest(request: FastifyRequest): string | null {
    // 手动指定的 authorization 优先级最高
    const headerToken = request.headers.authorization
    if (typeof headerToken === 'string' && headerToken) {
      const token = headerToken.replace('Bearer ', '')
      if (token) return token
    }

    // 最后是自动携带的 cookie
    const cookieToken = request.cookies.token
    if (typeof cookieToken === 'string' && cookieToken) {
      return cookieToken
    }

    return null
  }

  return fastifyPlugin(async app => {
    app.decorateRequest('user')
    app.decorateRequest('token')
    app.decorateRequest('secret')
    app.register(fastifyCookie, { hook: 'onRequest' })
    app.addHook('onRequest', async (request: FastifyRequest) => {
      const requestUrl = request.routeOptions.url
      const authPatch = getRouteAuthPath(requestUrl)
      const { auth = [] } = request.routeOptions.config

      const allAuth = [...auth, ...authPatch]
      const noLoginRequired = allAuth.includes('NoLoginRequired')
      const ignorePermission = allAuth.includes('IgnorePermission')

      // 无需登录，直接秒了
      if (noLoginRequired) return

      const tokenString = getTokenFromRequest(request)
      const [userResponse, userError] = await catchP(getUser({
        headers: {
          Authorization: `Bearer ${tokenString}`
        }
      }))

      if (userError != null) {
        throw new UnknownErrorResponse(userError)
      }

      if (userResponse.data != null) {
        if (userResponse.data.status !== 'SUCCESS') {
          throw new ErrorResponse(
            userResponse.data.status,
            userResponse.data.message
          )
        }

        request.user = userResponse.data.data
      }

      if (!ignorePermission) {
        const [verifyResponse, verifyError] = await catchP(verifyPermission({
          headers: {
            Authorization: `Bearer ${tokenString}`
          },
          body: {
            service: 'expense',
            resource: request.params,
            operation: request.routeOptions.schema!.operationId!,
          }
        }))

        if (verifyError != null) {
          throw new UnknownErrorResponse(verifyError)
        }

        if (verifyResponse.data != null) {
          if (verifyResponse.data.status !== 'SUCCESS') {
            throw new ErrorResponse(
              verifyResponse.data.status,
              verifyResponse.data.message
            )
          }

          if (verifyResponse.data.data !== 'Allow') {
            return {
              message: '',
              status: 'PROHIBITED_BY_PERMISSION',
            } satisfies ModelResponse['response']
          }
        }
      }
    })
  })
}
