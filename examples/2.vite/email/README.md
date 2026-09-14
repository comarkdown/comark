---
title: Email Preview
description: A live markdown editor that renders Comark content to MJML-compiled email HTML.
navigation:
  icon: i-lucide-mail
category: Vite
path: /examples/vite/email
---

::code-tree{defaultValue="src/main.ts" expandAll}

```ts [src/main.ts]
const updatePreview = async (markdown: string) => {
  const response = await fetch('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown }),
  })
  const result = (await response.json()) as EmailPreviewResult
  subject.textContent = result.subject ?? ''
  previewText.textContent = result.previewText ?? ''
  frame.srcdoc = result.html
}

input.value = SAMPLE
void updatePreview(SAMPLE)

let debounceTimer: ReturnType<typeof setTimeout>
input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void updatePreview(input.value)
  }, 150)
})
```

```ts [vite.config.ts]
import type { IncomingMessage, ServerResponse } from 'node:http'
import { renderEmail } from '@comark/email'
import { defineConfig, type Plugin } from 'vite'

const emailRenderMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
  if (req.url !== '/api/render' || req.method !== 'POST') {
    next()
    return
  }
  void (async () => {
    const { markdown } = JSON.parse(await readBody(req)) as { markdown: string }
    const result = await renderEmail(markdown)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))
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
```

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comark Email</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app">
      <div id="editor-pane">
        <div class="pane-header">Markdown</div>
        <textarea id="input" spellcheck="false"></textarea>
      </div>
      <div id="preview-pane">
        <div class="pane-header">Email Preview</div>
        <iframe id="preview" sandbox="allow-same-origin"></iframe>
      </div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```json [package.json]
{
  "name": "comark-email",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@comark/email": "workspace:*"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "vite": "catalog:"
  }
}
```

::

This example shows a split-pane live preview: write Comark markdown on the left and see MJML-compiled email HTML in a sandboxed `<iframe>` on the right. Rendering runs on the Vite server because `@comark/email` is Node-first.
