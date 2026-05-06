import { pascalCase } from 'scule'
import { localComponents, localComponentLoaders } from '#content/components'
import {
  UPageHero,
  UPageSection,
  UPageCard,
  UPageCTA,
  UButton,
  UBadge,
  UPageFeature,
  UPageGrid,
  UPricingPlan,
} from '#components'

// Define component imports for the docs app
const components: Record<string, () => Promise<unknown>> = {
  Playground: () => import('@/components/Playground.vue'),

  // Streaming components
  ComarkStream: () => import('@/components/ComarkStream.vue'),
  MarkdownItStream: () => import('@/components/MarkdownItStream.vue'),

  // Nuxt UI page components used in playground examples (explicit imports to ensure bundle inclusion)
  Alert: () => import('@nuxt/ui/components/Alert.vue'),
  Avatar: () => import('@nuxt/ui/components/Avatar.vue'),
  AvatarGroup: () => import('@nuxt/ui/components/AvatarGroup.vue'),
  Badge: () => import('@nuxt/ui/components/Badge.vue'),
  Banner: () => import('@nuxt/ui/components/Banner.vue'),
  Button: () => import('@nuxt/ui/components/Button.vue'),
  Calendar: () => import('@nuxt/ui/components/Calendar.vue'),
  Chip: () => import('@nuxt/ui/components/Chip.vue'),
  Collapsible: () => import('@nuxt/ui/components/Collapsible.vue'),
  FieldGroup: () => import('@nuxt/ui/components/FieldGroup.vue'),
  Icon: () => import('@nuxt/ui/components/Icon.vue'),
  Kbd: () => import('@nuxt/ui/components/Kbd.vue'),
  Progress: () => import('@nuxt/ui/components/Progress.vue'),
  Separator: () => import('@nuxt/ui/components/Separator.vue'),
  Skeleton: () => import('@nuxt/ui/components/Skeleton.vue'),
  Carousel: () => import('@nuxt/ui/components/Carousel.vue'),
  Empty: () => import('@nuxt/ui/components/Empty.vue'),
  Error: () => import('@nuxt/ui/components/Error.vue'),
  Timeline: () => import('@nuxt/ui/components/Timeline.vue'),
  User: () => import('@nuxt/ui/components/User.vue'),
  PageHero: () => import('@nuxt/ui/components/PageHero.vue'),
  PageAnchors: () => import('@nuxt/ui/components/PageAnchors.vue'),
  PageSection: () => import('@nuxt/ui/components/PageSection.vue'),
  PageHeader: () => import('@nuxt/ui/components/PageHeader.vue'),
  PageBody: () => import('@nuxt/ui/components/PageBody.vue'),
  PageCard: () => import('@nuxt/ui/components/PageCard.vue'),
  PageColumns: () => import('@nuxt/ui/components/PageColumns.vue'),
  PageCTA: () => import('@nuxt/ui/components/PageCTA.vue'),
  PageFeature: () => import('@nuxt/ui/components/PageFeature.vue'),
  PageGrid: () => import('@nuxt/ui/components/PageGrid.vue'),
  PageLogos: () => import('@nuxt/ui/components/PageLogos.vue'),
  PricingPlan: () => import('@nuxt/ui/components/PricingPlan.vue'),
  PricingPlans: () => import('@nuxt/ui/components/PricingPlans.vue'),
  PricingTable: () => import('@nuxt/ui/components/PricingTable.vue'),
  ChangelogVersion: () => import('@nuxt/ui/components/ChangelogVersion.vue'),
  ChangelogVersions: () => import('@nuxt/ui/components/ChangelogVersions.vue'),
  BlogPosts: () => import('@nuxt/ui/components/BlogPosts.vue'),
  BlogPost: () => import('@nuxt/ui/components/BlogPost.vue'),
  AuthForm: () => import('@nuxt/ui/components/AuthForm.vue'),

  // Custom playground showcase components (explicit imports to ensure bundle inclusion)
  Gallery: () => import('@/components/playground/Gallery.vue'),
  RatingBar: () => import('@/components/playground/RatingBar.vue'),
  HostInfo: () => import('@/components/playground/HostInfo.vue'),
  Facility: () => import('@/components/playground/Facility.vue'),
  TwoColumn: () => import('@/components/playground/TwoColumn.vue'),
  BookingCard: () => import('@/components/playground/BookingCard.vue'),
  Ingredients: () => import('@/components/playground/Ingredients.vue'),
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
