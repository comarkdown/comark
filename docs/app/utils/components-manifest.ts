import { pascalCase } from 'scule'

// Define component imports for the docs app
const components = {
  // Landing components
  LandingHero: () => import('@/components/landing/LandingHero.vue'),
  LandingGetStarted: () => import('@/components/landing/LandingGetStarted.vue'),
  LandingTypography: () => import('@/components/landing/LandingTypography.vue'),
  LandingCodeBlock: () => import('@/components/landing/LandingCodeBlock.vue'),
  LandingCjk: () => import('@/components/landing/LandingCjk.vue'),
  LandingGfm: () => import('@/components/landing/LandingGfm.vue'),
  LandingCompareGrid: () => import('@/components/LandingCompareGrid.vue'),

  // Streaming components
  MDCStream: () => import('@/components/MDCStream.vue'),
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
    // @ts-expect-error - this is a fallback
    return import('#content/components').then(m => m[pascalName]?.())
  }

  return loader()
}
