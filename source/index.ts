import { createApp } from 'app'
import { config } from '@helpers/config'

createApp().then(app => app.listen({ port: config.port, host: '0.0.0.0' }))
