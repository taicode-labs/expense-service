import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import * as pkg from '../../../package.json'

const accountServiceSchema = z.object({
  serverUrl: z.string(),
  secretKey: z.string(),
  secretValue: z.string()
})

const configSchema = z.object({
  serverUrl: z.string(),
  datasourceUrl: z.string(),
  port: z.number().default(3000),
  debug: z.boolean().default(false),
  version: z.string().default(pkg.version),
  account: accountServiceSchema,
})

function loadConfig() {
  let config: z.TypeOf<typeof configSchema>
  try {
    const fileContent = fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf-8')
    const jsonData = JSON.parse(fileContent)

    // 验证数据格式
    config = configSchema.parse(jsonData)
  } catch (error) {
    console.error('Error loading or validating JSON:', error)
    throw error
  }

  if (!config.serverUrl) {
    config.serverUrl = `http://localhost:${config.port}`
  }

  if (!config.datasourceUrl) {
    config.datasourceUrl = process.env.DATASOURCE_URL || ''
  }

  return config
}

export const config = loadConfig()
