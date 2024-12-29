import dayjs from 'dayjs'
import * as auth from '@taicode/auth-sdk'
import { config } from '@helpers/config'

import { client } from './account'

export function initClients() {
  client.setConfig({ baseUrl: config.account.serverUrl })
  client.interceptors.request.use(request => {
    // 业务方已经携带了用户的 token
    if (request.headers.get('Authorization')) {
      return request
    }

    const token = auth.signToken(config.account, {
      createdTime: dayjs().toISOString(),
      data: {}
    })

    request.headers.append('Authorization', `Bearer ${token}`)
    return request
  })
}
