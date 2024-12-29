import { catchP } from '@helpers/catch'
import { FastifyPluginAsync } from 'fastify'

import { ModelSchema } from './schema'

interface Service {
  health?: () => Promise<boolean>
}

interface HealthOptions {
  services: Service[]
}

/** 服务健康检查，符合 k8s 健康检查要求 */
// 非 200 的返回统一被认为不健康
export function createGlobalRouter(options: HealthOptions): FastifyPluginAsync {
  async function checkHealth(services: Service[]) {
    for (let index = 0; index < services.length; index++) {
      const service = services[index]
      if (service.health) {
        const [status, error] = await catchP(service.health())
        if (error != null) return false
        if (status != true) return false
      }
    }
    return true
  }

  return async (app) => {
    app.get('/health', { config: { auth: ['NoLoginRequired'] } }, async (_request, reply) => {
      const { services } = options
      const ok = await checkHealth(services)
      reply.code(ok ? 200 : 500).send('done')
    })

    // 返回所有的数据模型，方便 openapi 工具链使用
    app.get('/model', { config: { auth: ['NoLoginRequired'] }, schema: ModelSchema }, async (_request, reply) => {
      reply.code(200).send('Hello taicode!')
    })
  }
}
