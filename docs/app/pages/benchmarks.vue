<script setup lang="ts">
definePageMeta({
  footer: false,
})

const title = 'Benchmarks - Comark'
const description =
  'Performance benchmarks comparing Comark parsing and rendering against markdown-it, markdown-exit, and remark.'
useSeoMeta({
  title,
  description,
})
defineOgImage('Docs.satori', {
  headline: 'Benchmarks',
  title,
  description,
})

interface BenchEntry {
  name: string
  avg: number
  unit: string
  avgNs: number
}

interface BenchGroup {
  name: string
  entries: BenchEntry[]
}

interface BenchData {
  generated: string
  runtime: string
  cpu: string
  benchmarks: Record<string, BenchGroup[]>
}

const { data } = await useFetch<BenchData>('/api/benchmarks')

const searchQuery = ref('')
const selectedVariants = ref<Record<string, string>>({})

// Merge groups that share a " — " prefix within the same file into variant tabs
interface MergedGroup {
  id: string
  label: string
  file: string
  variants: { key: string; group: BenchGroup }[]
}

const mergedBenchmarks = computed<MergedGroup[]>(() => {
  if (!data.value?.benchmarks) return []
  const result: MergedGroup[] = []

  for (const [file, groups] of Object.entries(data.value.benchmarks)) {
    if (groups.length <= 1) {
      // Single group — no variant tabs needed
      result.push({
        id: `${file}:${groups[0]!.name}`,
        label: groups[0]!.name || file,
        file,
        variants: [{ key: '', group: groups[0]! }],
      })
      continue
    }

    // Multiple groups in same file — merge as variant tabs
    const label = file.replace(/^plugin-/, '').replace(/-/g, ' ')

    result.push({
      id: file,
      label,
      file,
      variants: groups.map((g) => {
        // Extract variant label from after " — " separator: "emoji — short text" → "Short"
        const sep = g.name.indexOf(' — ')
        const variantPart = sep > -1 ? g.name.slice(sep + 3) : g.name
        const sizeMatch = variantPart.match(/^(short|medium|long)\b/i)
        if (sizeMatch) {
          let key = sizeMatch[1].charAt(0).toUpperCase() + sizeMatch[1].slice(1)
          const extra = variantPart.match(/\((.+?)\)/)
          if (extra) key += ` (${extra[1].trim()})`
          return { key, group: g }
        }
        return { key: variantPart, group: g }
      }),
    })
  }

  return result
})

const filteredBenchmarks = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return mergedBenchmarks.value
  return mergedBenchmarks.value.filter(
    (m) =>
      m.label.toLowerCase().includes(q) ||
      m.file.toLowerCase().includes(q) ||
      m.variants.some(
        (v) => v.key.toLowerCase().includes(q) || v.group.entries.some((e) => e.name.toLowerCase().includes(q))
      )
  )
})

const totalGroups = computed(() => mergedBenchmarks.value.length)

const benchFiles = computed(() => {
  if (!data.value?.benchmarks) return []
  return Object.keys(data.value.benchmarks).sort()
})

function activeVariant(entry: MergedGroup) {
  if (entry.variants.length <= 1) return entry.variants[0]
  const sel = selectedVariants.value[entry.id]
  return entry.variants.find((v) => v.key === sel) || entry.variants[0]
}

function activeEntries(entry: MergedGroup): BenchEntry[] {
  const entries = activeVariant(entry)?.group.entries ?? []
  return [...entries].sort((a, b) => a.avgNs - b.avgNs)
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Performance-based colors: green (fastest) → red (slowest)
const perfColors = [
  'bg-emerald-500 dark:bg-emerald-400',
  'bg-lime-500 dark:bg-lime-400',
  'bg-amber-400 dark:bg-amber-300',
  'bg-orange-500 dark:bg-orange-400',
  'bg-red-500 dark:bg-red-400',
]

function barColor(entry: BenchEntry, entries: BenchEntry[]) {
  if (entries.length <= 1) return perfColors[0]
  const sorted = [...entries].sort((a, b) => a.avgNs - b.avgNs)
  const rank = sorted.findIndex((e) => e.name === entry.name)
  const idx = Math.round((rank / (entries.length - 1)) * (perfColors.length - 1))
  return perfColors[idx]
}

function formatTime(avg: number, unit: string) {
  return `${avg} ${unit}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Bar width: bars represent time — slowest gets 100%, fastest gets smallest bar
function barWidth(entry: BenchEntry, entries: BenchEntry[]) {
  const max = Math.max(...entries.map((e) => e.avgNs))
  if (max === 0) return 0
  return (entry.avgNs / max) * 100
}

// Generate an insight description for an expanded benchmark group
function groupDescription(entry: MergedGroup): string {
  const entries = activeEntries(entry)
  if (entries.length < 2) return ''

  // Detect baseline/plugin pairs for overhead comparison
  const pairs: { parser: string; baseline: BenchEntry; plugin: BenchEntry; overheadPct: number }[] = []
  for (const e of entries) {
    const n = e.name.toLowerCase()
    if (n.includes('+') || n.includes('typographer') || n.includes('punctuation') || n.includes('smartypants')) continue // skip plugin entries, we'll match them from baselines
    // Find matching plugin entry
    const plugin = entries.find((p) => {
      const pn = p.name.toLowerCase()
      if (pn === n) return false
      const baseName = n.replace(/\s*\(.*\)/, '') // strip "(unified)" etc.
      return pn.startsWith(baseName) && pn !== n
    })
    if (plugin) {
      const overheadPct = ((plugin.avgNs - e.avgNs) / e.avgNs) * 100
      pairs.push({ parser: e.name, baseline: e, plugin, overheadPct })
    }
  }

  if (pairs.length >= 2) {
    // Overhead comparison mode
    const sorted = [...pairs].sort((a, b) => a.overheadPct - b.overheadPct)
    const best = sorted[0]!
    const parts = sorted.map((p) => {
      const sign = p.overheadPct >= 0 ? '+' : ''
      return `${p.parser} ${sign}${Math.round(p.overheadPct)}%`
    })
    return `${best.parser} has the lowest plugin overhead (${parts.join(', ')}).`
  }

  // Check for streaming advantage vs non-comark competitors
  const streaming = entries.find((e) => e.name.toLowerCase().includes('streaming'))
  const competitors = entries.filter((e) => !e.name.toLowerCase().includes('comark'))
  if (streaming && competitors.length > 0) {
    const fastestCompetitor = competitors.reduce((a, b) => (a.avgNs < b.avgNs ? a : b))
    if (streaming.avgNs < fastestCompetitor.avgNs) {
      const speedup = (fastestCompetitor.avgNs / streaming.avgNs).toFixed(1)
      return `Comark streaming is ${speedup}× faster than ${fastestCompetitor.name} (${formatTime(streaming.avg, streaming.unit)}).`
    }
  }

  // Default: fastest entry with speedup ratio
  const fastest = entries.reduce((a, b) => (a.avgNs < b.avgNs ? a : b))
  const slowest = entries.reduce((a, b) => (a.avgNs > b.avgNs ? a : b))
  if (fastest.avgNs > 0 && slowest.avgNs > fastest.avgNs * 1.5) {
    const speedup = (slowest.avgNs / fastest.avgNs).toFixed(1)
    return `${fastest.name} is the fastest at ${formatTime(fastest.avg, fastest.unit)} — ${speedup}× faster than ${slowest.name}.`
  }
  return `${fastest.name} is the fastest at ${formatTime(fastest.avg, fastest.unit)}.`
}

function scrollToGroup(id: string) {
  const el = document.getElementById(`bench-${slugify(id)}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] bg-default">
    <!-- Header -->
    <div class="relative border-b border-default">
      <UContainer class="relative z-10 py-6 sm:py-10">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              <UIcon
                name="i-lucide-bar-chart-2"
                class="size-5 text-primary-500"
              />
              Benchmarks
            </h1>
            <p class="text-neutral-500 dark:text-neutral-400 text-sm max-w-xl">
              Performance comparisons across parsers, renderers, and plugins.
            </p>
          </div>
          <div
            v-if="data"
            class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums font-mono"
          >
            <span>{{ formatDate(data.generated) }}</span>
            <span>{{ data.cpu }}</span>
            <span>{{ data.runtime }}</span>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Context note -->
    <section class="border-b border-default p-5 sm:p-8 md:px-12 md:py-6">
      <UContainer>
        <div class="space-y-1.5 text-sm/6 text-muted">
          <p>
            Each benchmark compares the <strong class="text-highlighted font-medium">overhead</strong> that a plugin
            adds to baseline parsing. <strong class="text-primary">Comark</strong> consistently has the
            <strong class="text-highlighted font-medium">lowest plugin overhead</strong> across all benchmarks — its
            plugin architecture adds minimal cost on top of the parsing step.
          </p>
          <p>
            Bars represent speed: <span class="text-emerald-500 dark:text-emerald-400 font-medium">longer bars</span> =
            faster. Entries are sorted fastest-first.
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer>
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar -->
        <aside
          class="lg:w-56 shrink-0 lg:sticky lg:top-16 lg:self-start lg:border-r border-default p-5 sm:p-6 space-y-6"
        >
          <!-- Search -->
          <div class="relative">
            <UIcon
              name="i-lucide-search"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-dimmed"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Filter..."
              class="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-default bg-default text-default placeholder:text-dimmed focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
            />
          </div>

          <!-- TOC -->
          <nav
            v-if="filteredBenchmarks.length > 0"
            class="hidden lg:block"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Groups ({{ filteredBenchmarks.length
                }}<template v-if="searchQuery && filteredBenchmarks.length !== totalGroups">
                  /{{ totalGroups }} </template
                >)
              </p>
            </div>
            <ul class="space-y-0.5 max-h-[60vh] overflow-y-auto">
              <li
                v-for="entry in filteredBenchmarks"
                :key="entry.id"
              >
                <button
                  class="w-full text-left px-2 py-1 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 truncate transition-colors"
                  @click="scrollToGroup(entry.id)"
                >
                  {{ entry.label }}
                  <span
                    v-if="entry.variants.length > 1"
                    class="text-neutral-400 dark:text-neutral-500"
                    >({{ entry.variants.length }})</span
                  >
                </button>
              </li>
            </ul>
          </nav>

          <!-- Run locally -->
          <details
            v-if="benchFiles.length > 0"
            class="hidden lg:block"
          >
            <summary
              class="font-mono text-[0.65rem] font-semibold tracking-widest uppercase text-dimmed cursor-pointer select-none hover:text-muted"
            >
              Run locally
            </summary>
            <div class="mt-2 space-y-2 text-[11px] font-mono text-dimmed">
              <p
                v-for="file in benchFiles"
                :key="file"
                class="break-all"
              >
                npx tsx benchmarks/{{ file }}.ts
              </p>
              <hr class="border-muted" />
              <p class="break-all">node scripts/bench.mjs</p>
            </div>
          </details>
        </aside>

        <!-- Main content -->
        <div class="flex-1 min-w-0 space-y-4 py-6">
          <!-- Empty state -->
          <div
            v-if="filteredBenchmarks.length === 0"
            class="rounded-lg border border-dashed border-default py-16 text-center"
          >
            <p class="text-sm text-neutral-500 dark:text-neutral-400">No benchmarks match "{{ searchQuery }}"</p>
            <button
              class="mt-2 text-xs text-primary-500 hover:underline"
              @click="searchQuery = ''"
            >
              Clear filter
            </button>
          </div>

          <!-- Benchmark groups -->
          <div
            v-for="entry in filteredBenchmarks"
            :id="`bench-${slugify(entry.id)}`"
            :key="entry.id"
            class="rounded-lg border border-default bg-white dark:bg-neutral-900 overflow-hidden scroll-mt-20"
          >
            <!-- Group header -->
            <div class="w-full flex items-center gap-3 px-4 py-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <h2 class="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {{ entry.label }}
                  </h2>
                  <p
                    v-if="groupDescription(entry)"
                    class="px-4 pt-3 pb-2 text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    {{ groupDescription(entry) }}
                  </p>
                </div>
              </div>
              <div class="hidden sm:flex items-center gap-2 shrink-0">
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-mono tabular-nums"
                >
                  {{ entry.file }}.ts
                </span>
                <span class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ activeEntries(entry).length }} entries
                </span>
              </div>
            </div>

            <!-- Variant tabs -->
            <div
              v-if="entry.variants.length > 1"
              class="border-t border-default px-4 py-2 flex flex-wrap gap-1"
            >
              <button
                v-for="v in entry.variants"
                :key="v.key"
                class="px-2.5 py-1 text-xs rounded-md transition-colors"
                :class="
                  activeVariant(entry)?.key === v.key
                    ? 'bg-primary-500 text-white dark:bg-primary-400 dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                "
                @click.stop="selectedVariants[entry.id] = v.key"
              >
                {{ v.key }}
              </button>
            </div>

            <!-- Bar chart -->
            <div class="border-t border-default">
              <div
                v-for="(result, i) in activeEntries(entry)"
                :key="result.name"
                class="flex items-center gap-3 px-4 py-2"
                :class="{ 'border-t border-default/50': i > 0 }"
              >
                <!-- Color dot + name -->
                <div class="w-44 shrink-0 flex items-center gap-2 min-w-0">
                  <span
                    class="size-2 rounded-full shrink-0"
                    :class="barColor(result, activeEntries(entry))"
                  />
                  <span class="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                    {{ result.name }}
                  </span>
                </div>

                <!-- Bar -->
                <div class="flex-1 h-5 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                  <div
                    class="h-full rounded transition-all duration-500"
                    :class="barColor(result, activeEntries(entry))"
                    :style="{ width: barWidth(result, activeEntries(entry)) + '%' }"
                  />
                </div>

                <!-- Value -->
                <div class="w-20 shrink-0 flex items-center justify-end">
                  <span class="text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                    {{ formatTime(result.avg, result.unit) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Methodology note -->
          <p
            v-if="data"
            class="text-[11px] text-neutral-400 dark:text-neutral-500 pt-2 pb-8"
          >
            Benchmarks generated with
            <NuxtLink
              external
              href="https://github.com/evanwashere/mitata"
              class="underline hover:text-neutral-600 dark:hover:text-neutral-300"
              target="_blank"
              >mitata</NuxtLink
            >. Results vary by machine — run <code class="text-[10px]">node scripts/bench.mjs</code> locally for
            accurate numbers.
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>
