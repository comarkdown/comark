<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    icon?: string
    color?: string
    /** "owner/name", powers the repo link and, unless `author` is set, the avatar. Omit for a private repo. */
    repo?: string
    /** GitHub username or org, for the avatar and profile link when there's no public `repo` to derive it from. */
    author?: string
    /** npm package name, without the registry URL. */
    npm?: string
    /** External site when it isn't the GitHub repo (marketplace, docs, chrome store). */
    site?: string
    /** Overrides the GitHub destination with a deeper link (a PR or issue) instead of the repo root. */
    to?: string
    badge?: string
    /** Feature: larger card with a hover glow (Official). Compact: dense grid (packages). Showcase: full image, no footer (Built with Comark). */
    variant?: 'feature' | 'compact' | 'showcase'
    /** Showcase only: a 16:9 screenshot rendered above the title. */
    image?: string
  }>(),
  {
    variant: 'compact',
    color: 'var(--ui-text-highlighted)',
  }
)

const badgeColor = computed(() => (props.badge === 'Official' ? 'primary' : 'neutral'))

// A GitHub profile is public even when its repo is private, so `author` doesn't require `repo`.
const author = computed(() => props.author ?? props.repo?.split('/')[0])
const authorUrl = computed(() => (author.value ? `https://github.com/${author.value}` : undefined))
const avatarUrl = computed(() => (author.value ? `https://github.com/${author.value}.png?size=64` : undefined))
const siteLabel = computed(() => props.site?.replace(/^https?:\/\//, '').replace(/\/$/, ''))

// The footer GitHub icon always points at the repo root, independent of `to`.
const repoUrl = computed(() => (props.repo ? `https://github.com/${props.repo}` : undefined))
const npmUrl = computed(() => (props.npm ? `https://www.npmjs.com/package/${props.npm}` : undefined))

// Whole-card click target: `to` overrides (a PR, issue, or a showcase's live site),
// otherwise the repo, otherwise an external site (private repos, marketplaces).
const primaryTo = computed(() => props.to ?? repoUrl.value ?? props.site)

const isFeature = computed(() => props.variant === 'feature')
const isShowcase = computed(() => props.variant === 'showcase')
const iconClass = computed(() =>
  isFeature.value
    ? 'mb-2 size-8 text-(--eco-color) grayscale opacity-60 transition duration-200 group-hover:grayscale-0 group-hover:opacity-100'
    : 'size-6 text-(--eco-color)'
)
const titleClass = computed(() =>
  isShowcase.value ? 'text-base font-semibold text-highlighted' : 'text-sm font-medium text-highlighted'
)
const descriptionClass = computed(() => {
  if (isShowcase.value) return 'mt-1.5 text-sm leading-relaxed text-toned'
  if (isFeature.value) return 'mt-1 text-sm leading-relaxed text-toned'
  return 'mt-1 text-sm leading-relaxed line-clamp-2 text-muted'
})
</script>

<template>
  <UPageCard
    :to="primaryTo"
    target="_blank"
    :icon="isShowcase ? undefined : icon"
    :variant="isFeature ? 'subtle' : 'soft'"
    :spotlight="isFeature"
    :class="
      isFeature
        ? 'ecosystem-card group transition duration-200 hover:bg-default hover:ring-(--eco-ring) hover:shadow-[0_12px_32px_-20px_var(--eco-glow)]'
        : 'ecosystem-card'
    "
    :ui="{
      header: 'relative overflow-hidden rounded-md aspect-video mb-4',
      leadingIcon: iconClass,
      title: titleClass,
      description: descriptionClass,
      footer: 'pt-3 mt-3 flex items-center justify-between gap-2 relative z-1',
    }"
  >
    <template
      v-if="isShowcase"
      #header
    >
      <img
        :src="image"
        :alt="`${title} screenshot`"
        width="960"
        height="540"
        loading="lazy"
        class="w-full h-full object-cover object-top"
      />
    </template>

    <template #title>
      <span class="inline-flex items-center gap-2">
        {{ title }}
        <UBadge
          v-if="badge"
          :label="badge"
          :color="badgeColor"
          variant="subtle"
          size="sm"
        />
      </span>
    </template>

    <template #description>
      <slot />
    </template>

    <template #footer>
      <ULink
        v-if="author"
        :to="authorUrl"
        target="_blank"
        raw
        class="relative z-1 inline-flex items-center gap-1.5 text-xs text-muted hover:text-highlighted"
      >
        <UAvatar
          :src="avatarUrl"
          :alt="`${author} on GitHub`"
          size="3xs"
        />
        {{ author }}
      </ULink>
      <span
        v-else
        class="relative z-1 text-xs text-muted"
        >{{ siteLabel }}</span
      >

      <span class="relative z-1 flex items-center gap-0.5">
        <UButton
          v-if="repo"
          icon="i-simple-icons-github"
          :to="repoUrl"
          target="_blank"
          size="xs"
          variant="ghost"
          color="neutral"
          :aria-label="`${title} on GitHub`"
        />
        <UButton
          v-if="npm"
          icon="i-simple-icons-npm"
          :to="npmUrl"
          target="_blank"
          size="xs"
          variant="ghost"
          color="neutral"
          :aria-label="`${title} on npm`"
        />
        <UButton
          v-if="site && repo"
          icon="i-lucide-external-link"
          :to="site"
          target="_blank"
          size="xs"
          variant="ghost"
          color="neutral"
          :aria-label="`${title} site`"
        />
      </span>
    </template>
  </UPageCard>
</template>

<style scoped>
.ecosystem-card {
  --eco-color: v-bind(color);
  --eco-ring: color-mix(in oklab, var(--eco-color) 50%, var(--ui-border));
  --eco-glow: color-mix(in oklab, var(--eco-color) 40%, transparent);
}
</style>
