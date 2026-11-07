<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Brand name shown top-left. Also used for the downloaded file name. */
    name?: string
    version?: string
    date?: string
    /** Pill next to the brand name. */
    label?: string
    /** Footer text, usually your site. */
    url?: string
    /** Heading above the default slot. */
    heading?: string
    /** Accent color (any CSS color): brand square, version dot, bullets and inline code. */
    color?: string
  }>(),
  {
    name: 'Comark',
    version: '',
    date: '',
    label: 'Release',
    url: 'comark.dev',
    heading: "What's new",
    color: '#facc15',
  }
)

// Text props are hidden when empty; `{url}` without a value parses as `true`, which hides it too.
function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

const nameText = computed(() => text(props.name))
const labelText = computed(() => text(props.label))
const urlText = computed(() => text(props.url))
const dateText = computed(() => text(props.date))
const headingText = computed(() => text(props.heading))
const accent = computed(() => text(props.color) || '#facc15')

// Social card size (Open Graph / X): the canvas is always rendered at this size and scaled to fit.
const WIDTH = 1200
const HEIGHT = 630

const viewport = useTemplateRef<HTMLDivElement>('viewport')
const card = useTemplateRef<HTMLDivElement>('card')

const versionLabel = computed(() => {
  const v = text(props.version)
  if (!v) return ''
  return /^\d/.test(v) ? `v${v}` : v
})

const fileName = computed(() => {
  const slug = nameText.value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${[slug, versionLabel.value || 'release'].filter(Boolean).join('-')}.png`
})

const { scale, busy, download, copy } = useImageExport({
  width: WIDTH,
  height: HEIGHT,
  viewport,
  card,
  fileName: () => fileName.value,
})
</script>

<template>
  <div class="not-prose my-6 flex flex-col gap-3">
    <div
      ref="viewport"
      class="w-full overflow-hidden rounded-lg border border-default"
      :style="{ height: `${HEIGHT * scale}px` }"
    >
      <div
        :style="{
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }"
      >
        <div
          ref="card"
          class="release-image dark relative overflow-hidden bg-[#0a0a0a] font-sans text-white"
          :style="{ width: `${WIDTH}px`, height: `${HEIGHT}px`, '--release-accent': accent }"
        >
          <!-- Frame: vertical rails and hatched bands, matching the social card -->
          <div class="absolute inset-y-0 left-16 w-px bg-white/10" />
          <div class="absolute inset-y-0 right-16 w-px bg-white/10" />
          <div class="release-image-hatch absolute inset-x-0 top-14 h-10 border-y border-white/10" />
          <div class="release-image-hatch absolute inset-x-0 bottom-14 h-10 border-y border-white/10" />

          <div class="absolute inset-x-16 top-24 bottom-24 grid grid-cols-[1fr_440px]">
            <!-- Left: brand, version, title -->
            <div class="flex min-w-0 flex-col justify-between py-10 pr-10 pl-12">
              <div class="flex min-h-[34px] items-center gap-3">
                <span
                  v-if="nameText"
                  class="text-[34px] leading-none font-bold tracking-tight"
                >
                  {{ nameText }}<span class="ml-0.5 inline-block size-[9px] bg-(--release-accent)" />
                </span>
                <span
                  v-if="labelText"
                  class="rounded-full border border-white/15 px-3 py-1 font-mono text-[13px] tracking-widest text-white/60 uppercase"
                >
                  {{ labelText }}
                </span>
              </div>

              <div class="min-w-0">
                <p
                  v-if="versionLabel"
                  class="text-[104px] leading-[0.95] font-bold tracking-tighter"
                >
                  {{ versionLabel }}<span class="text-(--release-accent)">.</span>
                </p>
                <div
                  v-if="$slots.title"
                  class="mt-5 text-[34px] leading-tight font-semibold tracking-tight text-white [&_p]:m-0"
                >
                  <slot
                    name="title"
                    unwrap="p"
                  />
                </div>
                <div
                  v-if="$slots.description"
                  class="mt-3 line-clamp-3 text-[22px] leading-snug text-white/55 [&_p]:m-0"
                >
                  <slot
                    name="description"
                    unwrap="p"
                  />
                </div>
              </div>

              <div class="flex min-h-[15px] items-center gap-3 font-mono text-[15px] text-white/40">
                <span v-if="urlText">{{ urlText }}</span>
                <span
                  v-if="urlText && dateText"
                  class="size-1 rounded-full bg-white/30"
                />
                <span v-if="dateText">{{ dateText }}</span>
              </div>
            </div>

            <!-- Right: highlights (default slot) -->
            <div class="release-image-panel min-w-0 overflow-hidden border-l border-white/10 bg-white/[0.02] px-8 py-9">
              <p
                v-if="$slots.default && headingText"
                class="mb-5 font-mono text-[13px] tracking-widest text-white/40 uppercase"
              >
                {{ headingText }}
              </p>
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        label="Copy"
        icon="i-lucide-copy"
        color="neutral"
        variant="outline"
        size="sm"
        :loading="busy"
        @click="copy"
      />
      <UButton
        label="Download PNG"
        icon="i-lucide-download"
        color="neutral"
        size="sm"
        :loading="busy"
        @click="download"
      />
    </div>
  </div>
</template>

<style scoped>
.release-image-hatch {
  background-image: repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.07) 0 1px, transparent 1px 10px);
}

/* Highlights are regular markdown: give lists, paragraphs and code a fixed look inside the card. */
.release-image-panel :deep(ul),
.release-image-panel :deep(ol) {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.release-image-panel :deep(li) {
  position: relative;
  margin: 0;
  padding-left: 22px;
  font-size: 20px;
  line-height: 1.35;
  color: rgb(255 255 255 / 0.85);
}

.release-image-panel :deep(li)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 8px;
  height: 8px;
  background: var(--release-accent);
}

.release-image-panel :deep(li)::marker {
  content: '';
}

.release-image-panel :deep(p) {
  margin: 0 0 12px;
  font-size: 20px;
  line-height: 1.4;
  color: rgb(255 255 255 / 0.75);
}

.release-image-panel :deep(strong) {
  color: #fff;
  font-weight: 600;
}

.release-image-panel :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgb(255 255 255 / 0.12);
  background: rgb(255 255 255 / 0.06);
  color: var(--release-accent);
}

.release-image-panel :deep(pre) {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  background: transparent;
  border: 0;
  padding: 0;
}

.release-image-panel :deep(pre code) {
  border: 0;
  background: transparent;
  padding: 0;
  color: inherit;
}
</style>
