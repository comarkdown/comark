import { pascalCase } from 'scule'
import { localComponents, localComponentLoaders } from '#content/components'

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

  // Try the name as-is first
  const componentKey = name as keyof typeof components
  const pascalName = pascalCase(name) as keyof typeof components

  const loader = components[componentKey] || components[pascalName]
  if (!loader) {
    if (localComponents.includes(pascalName)) {
      return localComponentLoaders[pascalName]()
    }
  }

  return loader?.()
}
