import type { Nuxt } from 'nuxt/schema'

const DEVTOOLS_URL = 'https://comark.dev/embed/devtools'

export function setupDevTools(nuxt: Nuxt): void {
  if (!nuxt.options.dev) return

  // @ts-expect-error - hook exists
  nuxt.hook('devtools:customTabs', (tabs) => {
    tabs.push({
      name: 'comark',
      title: 'Comark',
      icon: 'https://comark.dev/favicon.svg',
      view: {
        type: 'iframe',
        src: DEVTOOLS_URL,
      },
    })
  })
}
