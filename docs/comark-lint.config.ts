import { readdirSync } from 'node:fs'
import preset from 'comark-docs/lint.mjs'

// The site's own Markdown components: @comark/nuxt registers app/components/prose/ globally.
const prose = readdirSync('app/components/prose').map((file) =>
  file.replace(/\.vue$/, '').replace(/[A-Z]/g, (c, i) => (i ? '-' : '') + c.toLowerCase())
)

export default {
  ...preset,
  components: [...preset.components, ...prose],
  links: {
    ...preset.links,
    // Vue pages, not Markdown.
    routes: (path: string) => ['/play', '/stream'].includes(path) || preset.links.routes(path),
  },
}
