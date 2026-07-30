import type { NavigationMenuItem } from '@nuxt/ui/components/NavigationMenu.vue'
import { playgroundExamples } from '~/constants'

interface NavItem {
  path?: string
  title: string
  children?: NavItem[]
  [key: string]: unknown
}

export function useMainNavigation() {
  const route = useRoute()

  return computed<NavigationMenuItem[]>(() => [
    {
      label: 'Documentation',
      to: '/getting-started/introduction',
      icon: 'i-lucide-book-open',
      active: ['getting-started', 'syntax', 'rendering', 'api', 'integrations'].includes(
        route.path?.split('/')[1] || ''
      ),
    },
    {
      label: 'Plugins',
      to: '/plugins',
      icon: 'i-lucide-plug',
      active: route.path.startsWith('/plugins'),
    },
    {
      label: 'Examples',
      to: '/examples',
      icon: 'i-lucide-layout-panel-left',
      active: route.path.startsWith('/examples'),
    },
    {
      label: 'Playground',
      to: '/play',
      icon: 'i-lucide-play',
      active: route.path.startsWith('/play'),
      children: playgroundExamples.map((example) => ({
        label: example.label,
        to: example.to ?? `/play/${example.value}`,
        active: route.path.startsWith(`/play/${example.value}`),
      })),
    },
    {
      label: 'GitHub',
      to: 'https://github.com/comarkdown/comark',
      target: '_blank',
      icon: 'i-lucide-github',
    },
  ])
}

export function useFilteredNavigation(): ComputedRef<NavItem[]> {
  const route = useRoute()
  const navigation = inject<Ref<NavItem[]>>('navigation')

  return computed(() => {
    if (route.path.startsWith('/plugins')) {
      const pluginsSection = navigation?.value?.find((item) => item.path === '/plugins')
      return (pluginsSection?.children as NavItem[]) || []
    }

    if (route.path.startsWith('/examples')) {
      const examplesSection = navigation?.value?.find((item) => item.path === '/examples')
      return (examplesSection?.children as NavItem[]) || []
    }

    return (navigation?.value || []).filter((item) => item.path !== '/plugins' && item.path !== '/examples')
  })
}
