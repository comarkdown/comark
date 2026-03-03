import { pascalCase } from 'scule'
import { localComponents } from '#content/components'

const components = {
  ComarkStream: () => import('@/components/ComarkStream.vue'),
  MarkdownItStream: () => import('@/components/MarkdownItStream.vue'),
}

export default function resolveComponent(name: string) {
  if (name === 'span') {
    return null
  }

  const componentKey = name as keyof typeof components
  const pascalName = pascalCase(name) as keyof typeof components

  const loader = components[componentKey] || components[pascalName]
  if (!loader) {
    if (localComponents.includes(pascalName)) {
      // @ts-expect-error - this is a fallback
      return import('#content/components').then(m => m[pascalName]?.())
    }
  }

  return loader?.()
}
