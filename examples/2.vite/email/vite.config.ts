import type { IncomingMessage, ServerResponse } from 'node:http'
import { renderEmail } from '@comark/email'
import { defineConfig, type Plugin } from 'vite'

const readBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })

const emailRenderMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
  if (req.url !== '/api/render' || req.method !== 'POST') {
    next()
    return
  }
  void (async () => {
    try {
      const { markdown } = JSON.parse(await readBody(req)) as { markdown: string }
      const result = await renderEmail(markdown)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ html: '', errors: [String(error)] }))
    }
  })()
}

const emailRenderPlugin = (): Plugin => ({
  name: 'comark-email-render',
  configureServer(server) {
    server.middlewares.use(emailRenderMiddleware)
  },
  configurePreviewServer(server) {
    server.middlewares.use(emailRenderMiddleware)
  },
})

export default defineConfig({
  plugins: [emailRenderPlugin()],
})
