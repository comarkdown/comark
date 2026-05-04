import { pascalCase } from 'scule'
import { localComponents, localComponentLoaders } from '#content/components'
import {
  UPageHero,
  UPageSection,
  UPageCard,
  UPageCTA,
  UButton,
  UBadge,
} from '#components'

// Define component imports for the docs app
const components: Record<string, () => Promise<unknown>> = {
  Playground: () => import('@/components/Playground.vue'),

  // Streaming components
  ComarkStream: () => import('@/components/ComarkStream.vue'),
  MarkdownItStream: () => import('@/components/MarkdownItStream.vue'),

  // Nuxt UI page components used in playground examples (explicit imports to ensure bundle inclusion)
  UPageHero: () => Promise.resolve(UPageHero),
  UPageSection: () => Promise.resolve(UPageSection),
  UPageCard: () => Promise.resolve(UPageCard),
  UPageCTA: () => Promise.resolve(UPageCTA),
  UButton: () => Promise.resolve(UButton),
  UBadge: () => Promise.resolve(UBadge),
  Badge: () => Promise.resolve(UBadge),
}

export default function resolveComponent(name: string) {
  if (name === 'span') {
    return null
  }

  const pascalName = pascalCase(name)

  // 1. Explicit local components
  const loader = components[name] || components[pascalName]
  if (loader) return loader()

  // 2. Content components (custom playground components)
  if (localComponents.includes(pascalName)) {
    return (localComponentLoaders as Record<string, () => Promise<unknown>>)[pascalName]?.()
  }

  return null
}
