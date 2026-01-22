import { pascalCase } from 'scule'

const components = {
  AppLogo: () => import('@/components/AppLogo.vue'),
  ShikiCode: () => import('@/components/ShikiCode.vue'),
  MultiSlotTest: () => import('@/components/MultiSlotTest.vue'),
  RequiredPropTest: () => import('@/components/RequiredPropTest.vue'),
}

export default async function resolveComponent(name: string) {
  // Try the name as-is first
  let componentKey = name as keyof typeof components

  // If not found, try converting kebab-case to PascalCase
  if (!components[componentKey]) {
    componentKey = pascalCase(name) as keyof typeof components
  }

  const loader = components[componentKey]
  if (!loader) {
    throw new Error(`Component "${name}" not found in manifest`)
  }

  return loader()
}
