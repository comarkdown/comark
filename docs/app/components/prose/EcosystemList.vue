<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

interface EcosystemPackage {
  name: string
  description: string
  author: string
  category: 'Renderers' | 'Plugins' | 'Integrations' | 'Tooling'
  /** Tooling only: UI, Extensions, Templates, CLI, Agents. Shown in the badge instead of the category. */
  subcategory?: string
  /** "owner/name" — powers the row link and the author avatar. */
  repo?: string
  /** Link fallback for entries without a public repo. */
  url?: string
  official?: boolean
  icon?: string
  /** Tints the icon and its hover glow. Omitted entries fall back to a neutral tile. */
  color?: string
}

const props = defineProps<{ packages: EcosystemPackage[] }>()

const categories = ['All', 'Renderers', 'Plugins', 'Integrations', 'Tooling'] as const

const route = useRoute()
const router = useRouter()

const query = ref('')
const officialOnly = ref(false)
const category = ref<(typeof categories)[number]>('All')

// Content is ISR-cached, so the query string can't drive the first render
onMounted(() => {
  const q = route.query.q
  if (typeof q === 'string') query.value = q
  if (route.query.official === '1') officialOnly.value = true
  const cat = route.query.category
  if (typeof cat === 'string') {
    const match = categories.find((c) => c.toLowerCase() === cat)
    if (match) category.value = match
  }
})

const debouncedQuery = refDebounced(query, 200)

watch([debouncedQuery, officialOnly, category], ([q, official, cat]) => {
  const next = { ...route.query }
  if (q) next.q = q
  else delete next.q
  if (official) next.official = '1'
  else delete next.official
  if (cat !== 'All') next.category = cat.toLowerCase()
  else delete next.category
  router.replace({ query: next })
})

const searchPool = computed(() => {
  const q = debouncedQuery.value.trim().toLowerCase()
  return props.packages.filter((pkg) => {
    if (officialOnly.value && !pkg.official) return false
    if (!q) return true
    return (
      pkg.name.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.author.toLowerCase().includes(q)
    )
  })
})

const counts = computed(() => {
  const map = new Map<string, number>([['All', searchPool.value.length]])
  for (const cat of categories.slice(1)) {
    map.set(cat, searchPool.value.filter((pkg) => pkg.category === cat).length)
  }
  return map
})

const visible = computed(() => {
  const pool =
    category.value === 'All' ? searchPool.value : searchPool.value.filter((pkg) => pkg.category === category.value)
  return [...pool].sort((a, b) => {
    if (!!a.official !== !!b.official) return a.official ? -1 : 1
    return a.name.localeCompare(b.name)
  })
})

function href(pkg: EcosystemPackage) {
  return pkg.url ?? (pkg.repo ? `https://github.com/${pkg.repo}` : undefined)
}

function avatarUrl(pkg: EcosystemPackage) {
  return `https://github.com/${pkg.author}.png?size=64`
}

function tag(pkg: EcosystemPackage) {
  return pkg.category === 'Tooling' && pkg.subcategory ? pkg.subcategory : pkg.category
}

function monogram(name: string) {
  const cleaned = name.replace(/^@[^/]+\//, '').replace(/^comark-?/i, '')
  return (cleaned || name).slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="not-prose">
    <div class="flex gap-3">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        size="lg"
        placeholder="Search packages…"
        class="flex-1"
        :ui="{ base: 'rounded-lg' }"
      />
      <button
        type="button"
        role="switch"
        :aria-checked="officialOnly"
        class="flex shrink-0 items-center gap-2 rounded-lg border border-default px-3 text-sm font-medium text-toned transition-colors hover:text-highlighted"
        @click="officialOnly = !officialOnly"
      >
        <span
          class="flex size-3.5 items-center justify-center rounded-xs border border-default transition-colors"
          :class="officialOnly ? 'border-inverted bg-inverted' : 'bg-default'"
        >
          <UIcon
            v-if="officialOnly"
            name="i-lucide-check"
            class="size-2.5 text-inverted"
          />
        </span>
        Official only
      </button>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        :aria-pressed="category === cat"
        class="flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors"
        :class="
          category === cat ? 'bg-inverted text-inverted' : 'border border-default text-toned hover:border-accented'
        "
        @click="category = cat"
      >
        {{ cat }}
        <span
          class="font-mono text-xs"
          :class="category === cat ? 'text-inverted/60' : 'text-dimmed'"
        >
          {{ counts.get(cat) }}
        </span>
      </button>
    </div>

    <UCard
      variant="outline"
      class="mt-6"
      :ui="{ body: 'p-0 sm:p-0 divide-y divide-default' }"
    >
      <a
        v-for="pkg in visible"
        :key="pkg.name"
        :href="href(pkg)"
        target="_blank"
        rel="noopener"
        :class="pkg.color ? 'eco-row' : 'hover:bg-muted'"
        :style="pkg.color ? { '--eco-color': pkg.color } : undefined"
        class="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3.5 transition-colors md:grid-cols-[2.25rem_minmax(0,1fr)_7rem_1.25rem]"
      >
        <div
          class="eco-tile flex size-9 shrink-0 items-center justify-center rounded-lg border border-default bg-muted"
          :style="pkg.color ? { color: pkg.color } : undefined"
        >
          <UIcon
            v-if="pkg.icon"
            :name="pkg.icon"
            class="size-5"
            :class="!pkg.color && 'text-toned'"
          />
          <span
            v-else
            class="font-mono text-xs font-medium"
            :class="!pkg.color && 'text-toned'"
            >{{ monogram(pkg.name) }}</span
          >
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span class="text-sm font-medium text-highlighted">{{ pkg.name }}</span>
            <span
              v-if="pkg.official"
              class="rounded-xs bg-primary-50 px-1.5 py-px text-xs font-medium text-primary-700 dark:bg-primary-900/15 dark:text-primary-400"
            >
              Official
            </span>
            <span class="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
              <img
                :src="avatarUrl(pkg)"
                :alt="pkg.author"
                width="16"
                height="16"
                loading="lazy"
                class="size-4 shrink-0 rounded-full"
              />
              <span class="truncate">{{ pkg.author }}</span>
            </span>
          </div>
          <p class="mt-0.5 truncate text-sm text-muted">{{ pkg.description }}</p>
        </div>

        <span class="justify-self-end rounded-md border border-default px-2 py-0.5 font-mono text-xs text-muted">
          {{ tag(pkg) }}
        </span>

        <UIcon
          name="i-lucide-arrow-up-right"
          class="hidden size-4 text-dimmed md:block"
        />
      </a>

      <p
        v-if="!visible.length"
        class="py-10 text-center text-sm text-muted"
      >
        No packages match.
      </p>
    </UCard>
  </div>
</template>

<style scoped>
.eco-tile {
  transition:
    background-color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.eco-row:hover {
  background-color: color-mix(in oklab, var(--eco-color) 6%, transparent);
}

.eco-row:hover .eco-tile {
  border-color: color-mix(in oklab, var(--eco-color) 45%, var(--ui-border));
  box-shadow:
    0 0 0 3px color-mix(in oklab, var(--eco-color) 10%, transparent),
    0 6px 16px -8px color-mix(in oklab, var(--eco-color) 35%, transparent);
}
</style>
