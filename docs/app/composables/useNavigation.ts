import type { ContentNavigationItem } from '@nuxt/content'
import type { NavigationMenuItem } from '@nuxt/ui'

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
      children: [
        {
          label: 'Booking',
          to: '/play/booking',
          active: route.path.startsWith('/play/booking'),
        },
        {
          label: 'Recipe',
          to: '/play/recipe',
          active: route.path.startsWith('/play/recipe'),
        },
        {
          label: 'All Features',
          to: '/play/all-features',
          active: route.path.startsWith('/play/all-features'),
        },
      ],
    },
  ])
}

export function useFilteredNavigation(): ComputedRef<ContentNavigationItem[]> {
  const route = useRoute()
  const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
  const examplesNavigation = inject<Ref<ContentNavigationItem[]>>(
    'examplesNavigation',
    ref<ContentNavigationItem[]>([])
  )
  return computed(() => {
    if (route.path.startsWith('/plugins')) {
      const pluginsSection = navigation?.value?.find((item) => item.path === '/plugins')
      return pluginsSection?.children || []
    }

    if (route.path.startsWith('/examples')) {
      const raw = examplesNavigation?.value || []
      const root = raw.find((item) => item.path === '/examples')
      const categories = root?.children || raw
      return categories.map((category) => ({
        ...category,
        children: category.children ? collapseReadmeNav(category.children) : [],
      }))
    }

    return (navigation?.value || []).filter((item) => item.path !== '/plugins' && item.path !== '/examples')
  })
}

function collapseReadmeNav(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.map((item) => {
    if (!item.children?.length) {
      const path = item.path?.replace(/\/readme$/, '')
      return { ...item, path, icon: item.icon }
    }
    const readme = item.children.find((c) => c.path?.endsWith('/readme'))
    if (readme) {
      const path = readme.path!.replace(/\/readme$/, '')
      return { ...readme, path, icon: readme.icon, children: undefined }
    }
    return { ...item, children: collapseReadmeNav(item.children) }
  })
}
