---
title: HTML Preview
description: A live markdown editor that renders Comark content to HTML and displays it in a sandboxed iframe preview, with syntax highlighting support.
navigation.icon: i-lucide-file-code
category: Vite
path: /examples/vite/html
---

::code-tree{defaultValue="src/main.ts" expandAll}

```ts [src/main.ts]
import { createRender } from '@comark/html'
import highlight from 'comark/plugins/highlight'

const render = createRender({
  parse: { plugins: [highlight()] },
})

const PREVIEW_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 15px;
    line-height: 1.7;
    color: #1a1a2e;
    max-width: 720px;
    margin: 0 auto;
    padding: 32px 24px;
  }
  /* ... */
`

async function updatePreview(markdown: string) {
  const html = await render(markdown)
  const frame = document.getElementById('preview') as HTMLIFrameElement
  frame.srcdoc = `<!doctype html><html><head><style>${PREVIEW_STYLES}</style></head><body>${html}</body></html>`
}

const input = document.getElementById('input') as HTMLTextAreaElement
input.value = SAMPLE
updatePreview(SAMPLE)

let debounceTimer: ReturnType<typeof setTimeout>
input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => updatePreview(input.value), 150)
})
```

```css [src/style.css]
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background: #1a1a2e;
  font-family: system-ui, sans-serif;
}

#app {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  gap: 1px;
  background: #2a2a3e;
}

.pane-header {
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  background: #1e1e32;
  border-bottom: 1px solid #2a2a3e;
  user-select: none;
}

#editor-pane {
  display: flex;
  flex-direction: column;
  background: #1e1e32;
  overflow: hidden;
}

#input {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  background: #1e1e32;
  color: #cdd6f4;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 16px;
  tab-size: 2;
}

#preview-pane {
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

#preview {
  flex: 1;
  border: none;
  background: #fff;
}
```

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comark HTML</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app">
      <div id="editor-pane">
        <div class="pane-header">Markdown</div>
        <textarea id="input" spellcheck="false"></textarea>
      </div>
      <div id="preview-pane">
        <div class="pane-header">HTML Preview</div>
        <iframe id="preview" sandbox="allow-same-origin"></iframe>
      </div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```json [package.json]
{
  "name": "comark-html",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "comark": "workspace:*",
    "@comark/html": "workspace:*",
    "shiki": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vite": "^7.3.1"
  }
}
```

```json [tsconfig.json]
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["esnext", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

::

This example shows a split-pane live preview: write Comark markdown on the left and see it rendered as styled HTML in a sandboxed `<iframe>` on the right. The `highlight` plugin enables syntax highlighting for code blocks. Custom styles are injected into the iframe via `srcdoc` for proper CSS isolation.
