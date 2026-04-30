import { pascalCase } from 'scule'
import { localComponents, localComponentLoaders } from '#content/components'
import * as nuxtComponents from '#components'

// Define component imports for the docs app
const components = {
  Playground: () => import('@/components/Playground.vue'),

  // Streaming components
  ComarkStream: () => import('@/components/ComarkStream.vue'),
  MarkdownItStream: () => import('@/components/MarkdownItStream.vue'),
}

export default function resolveComponent(name: string) {
  if (name === 'span') {
    return null
  }

  const componentKey = name as keyof typeof components
  const pascalName = pascalCase(name) as keyof typeof components

  // 1. Explicit local components
  const loader = components[componentKey] || components[pascalName]
  if (loader) return loader()

  // 2. Content components (custom playground components)
  if (localComponents.includes(pascalName)) {
    return localComponentLoaders[pascalName]()
  }

  // 3. All registered Nuxt components (covers non-prose Nuxt UI components)
  try {
    const nuxtComponent = (nuxtComponents as Record<string, unknown>)[pascalName]
    if (nuxtComponent) return Promise.resolve(nuxtComponent)
  } catch {}

  return null
}
