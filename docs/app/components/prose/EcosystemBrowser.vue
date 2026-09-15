<script lang="ts">
import type { InjectionKey } from 'vue'

export interface EcosystemFacetContext {
  isVisible: (title: string) => boolean
}

// Shared with EcosystemCard.vue, which injects this to know whether to hide itself. A plain
// `<script>` block (rather than declaring it in `<script setup>`) is what makes it importable.
export const ecosystemFacetKey: InjectionKey<EcosystemFacetContext> = Symbol('ecosystem-facet')
</script>

<script setup lang="ts">
import { computed, provide, useSlots, type VNode } from 'vue'

interface CardMeta {
  title: string
  type: string
  category: string
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')

function uniqueOrdered(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    if (seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

// `slots.default()` closes over a stable array of already-rendered card vnodes — safe to read
// more than once because the underlying markdown doesn't change at runtime. It must stay lazy
// (a computed, first read from the template below) rather than called eagerly here in `setup()`:
// Vue only tracks a slot invocation's dependencies, and avoids its "invoked outside render" warning,
// when the call happens during the component's own render pass. Metadata only — the vnodes
// themselves are never touched or cloned; `<slot />` renders them as-is and each card hides
// itself via injected context, so a filter change never re-patches an already-mounted card.
const slots = useSlots()
const cardMetas = computed<CardMeta[]>(() =>
  (slots.default?.() ?? [])
    .filter((node): node is VNode => typeof node === 'object' && node !== null && !!(node as VNode).props)
    .map((node) => {
      const props = (node.props ?? {}) as Record<string, unknown>
      return {
        title: typeof props.title === 'string' ? props.title : '',
        type: typeof props.type === 'string' && props.type ? props.type : 'Other',
        category: typeof props.category === 'string' && props.category ? props.category : 'Other',
      }
    })
    .filter((card) => card.title)
)

const typeLabels = computed(() => uniqueOrdered(cardMetas.value.map((c) => c.type)))
const typeSlugToLabel = computed(() => new Map(typeLabels.value.map((label) => [slugify(label), label])))
const defaultTypeSlug = computed(() => (typeLabels.value.length ? slugify(typeLabels.value[0]!) : ''))

const route = useRoute()
const router = useRouter()

// UTabs matches `v-model` against each item's `value`, so this stays in slug space; `activeType`
// below derives the actual label used for filtering. No "all" option — the first type in document
// order (Renderers) is the default, and omitted from the URL to keep the canonical link clean.
//
// UTabs' `activationMode: 'automatic'` (its default) selects on focus as well as click, and a mouse
// click focuses its target as a side effect — so a single click fires this setter twice in the same
// tick. Two overlapping `router.replace` calls each snapshot `route.query` before the other lands,
// and race: whichever resolves last wins, sometimes with a stale query. `pendingTypeSlug` skips the
// second identical call outright instead of relying on the navigations to resolve consistently.
let pendingTypeSlug: string | null = null
const activeTypeSlug = computed<string>({
  get: () => {
    const slug = route.query.type
    return typeof slug === 'string' && typeSlugToLabel.value.has(slug) ? slug : defaultTypeSlug.value
  },
  set: (slug) => {
    if (slug === pendingTypeSlug) return
    pendingTypeSlug = slug
    const query = { ...route.query }
    if (slug === defaultTypeSlug.value) delete query.type
    else query.type = slug
    router.replace({ query }).finally(() => {
      if (pendingTypeSlug === slug) pendingTypeSlug = null
    })
  },
})

const activeType = computed(() => typeSlugToLabel.value.get(activeTypeSlug.value) ?? typeLabels.value[0] ?? '')

const tabs = computed(() => typeLabels.value.map((label) => ({ label, value: slugify(label) })))

const typePool = computed(() => cardMetas.value.filter((c) => c.type === activeType.value))

// Scoped to the active tab, so every label listed here always has at least one match — no
// disabled/greyed-out state needed. Switching tabs changes which categories exist to filter by.
const categoryLabels = computed(() => uniqueOrdered(typePool.value.map((c) => c.category)))
const categorySlugToLabel = computed(() => new Map(categoryLabels.value.map((label) => [slugify(label), label])))

// Derived straight from the URL rather than a locally-seeded mutable Set, so the first read
// naturally happens during render too (see `cardMetas` above). Because `categorySlugToLabel` is
// tab-scoped, a category slug left over from another tab simply fails to decode here — filter
// selections are remembered per tab without any extra cleanup on tab switch.
const activeCategories = computed<Set<string>>(() => {
  const raw = route.query.categories
  if (typeof raw !== 'string' || !raw) return new Set()
  const labels = raw
    .split(',')
    .map((slug) => categorySlugToLabel.value.get(slug))
    .filter((label): label is string => !!label)
  return new Set(labels)
})

// Same duplicate-emit guard as `activeTypeSlug` — cheap insurance against the same race if a
// category control ever fires twice per interaction.
let pendingCategoriesKey: string | null = null
function setCategories(labels: Set<string>) {
  const key = [...labels].sort().join(',')
  if (key === pendingCategoriesKey) return
  pendingCategoriesKey = key
  const query = { ...route.query }
  if (labels.size === 0) delete query.categories
  else query.categories = [...labels].map(slugify).join(',')
  router.replace({ query }).finally(() => {
    if (pendingCategoriesKey === key) pendingCategoriesKey = null
  })
}

function toggleCategory(label: string) {
  const next = new Set(activeCategories.value)
  if (next.has(label)) next.delete(label)
  else next.add(label)
  setCategories(next)
}

function clearCategories() {
  setCategories(new Set())
}

const visibleTitles = computed(() => {
  const titles = new Set<string>()
  for (const card of typePool.value) {
    if (activeCategories.value.size > 0 && !activeCategories.value.has(card.category)) continue
    titles.add(card.title)
  }
  return titles
})

provide(ecosystemFacetKey, { isVisible: (title) => visibleTitles.value.has(title) })

const hasResults = computed(() => visibleTitles.value.size > 0)
</script>

<template>
  <div class="not-prose my-6">
    <UTabs
      v-model="activeTypeSlug"
      :items="tabs"
      variant="link"
      color="neutral"
      :content="false"
      class="mb-6"
    />

    <div
      v-if="categoryLabels.length"
      class="mb-4 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden"
    >
      <UButton
        v-for="label in categoryLabels"
        :key="label"
        :label="label"
        :color="activeCategories.has(label) ? 'primary' : 'neutral'"
        :variant="activeCategories.has(label) ? 'subtle' : 'outline'"
        size="sm"
        class="shrink-0"
        @click="toggleCategory(label)"
      />
    </div>

    <div class="flex gap-6">
      <aside
        v-if="categoryLabels.length"
        class="hidden w-44 shrink-0 lg:block"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-semibold text-muted uppercase">Categories</span>
          <UButton
            v-if="activeCategories.size"
            label="Clear"
            color="neutral"
            variant="link"
            size="xs"
            class="p-0"
            @click="clearCategories"
          />
        </div>
        <ul class="max-h-[13rem] space-y-0.5 overflow-y-auto pr-1">
          <li
            v-for="label in categoryLabels"
            :key="label"
          >
            <button
              type="button"
              class="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors"
              :class="
                activeCategories.has(label)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted hover:bg-elevated hover:text-highlighted'
              "
              @click="toggleCategory(label)"
            >
              {{ label }}
            </button>
          </li>
        </ul>
      </aside>

      <div class="min-w-0 flex-1">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <slot />
        </div>

        <div
          v-if="!hasResults"
          class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-default py-16 text-center"
        >
          <p class="text-sm text-muted">No projects match these filters.</p>
          <UButton
            label="Clear categories"
            color="neutral"
            variant="outline"
            size="sm"
            @click="clearCategories"
          />
        </div>
      </div>
    </div>
  </div>
</template>
