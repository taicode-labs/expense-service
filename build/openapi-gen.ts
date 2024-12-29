import { createClient } from '@hey-api/openapi-ts'

async function accountService() {
  await createClient({
    client: '@hey-api/client-fetch',
    output: 'source/clients/account',
    // input: 'http://127.0.0.1:3000/openapi.json',
    input: 'https://account.service.taicode.app/openapi.json',
  })
}

accountService()
