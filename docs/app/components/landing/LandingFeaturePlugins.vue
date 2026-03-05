<script setup lang="ts">
interface Plugin {
  id: string
  name: string
  icon: string
  description: string
  input: string
  package: string
}

const props = defineProps<{
  headline: string
  title: string
  description: string
  linkLabel: string
  linkTo: string
  plugins: Plugin[]
}>()

const activePlugin = ref(props.plugins[0]?.id ?? '')

const current = computed(() => props.plugins.find(p => p.id === activePlugin.value) ?? props.plugins[0]!)
</script>

<template>
  <div class="border-b border-default">
    <div class="grid lg:grid-cols-2">
      <div class="border-b border-default p-6 lg:border-r lg:border-b-0 lg:p-8">
        <span
          v-if="headline"
          class="section-label"
        >
          {{ headline }}
        </span>
        <h2 class="mt-4 text-2xl font-bold text-highlighted">
          {{ title }}
        </h2>
        <p class="mt-3 text-base/7 text-muted">
          {{ description }}
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <UButton
            v-for="plugin in plugins"
            :key="plugin.id"
            :label="plugin.name"
            :icon="plugin.icon"
            :variant="activePlugin === plugin.id ? 'soft' : 'outline'"
            :color="activePlugin === plugin.id ? 'primary' : 'neutral'"
            size="xs"
            @click="activePlugin = plugin.id"
          />
        </div>

        <p class="mt-6 text-sm/6 text-muted">
          {{ current.description }}
        </p>

        <UButton
          :label="linkLabel"
          :to="linkTo"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
          class="mt-4 px-0"
        />
      </div>

      <div class="flex flex-col">
        <div class="flex items-center justify-between border-b border-default bg-muted/30 px-6 py-2.5 lg:px-8">
          <span class="font-mono text-xs text-dimmed">input.md</span>
          <UBadge
            :label="current.package"
            variant="subtle"
            color="neutral"
            size="sm"
            :ui="{ base: 'font-mono' }"
          />
        </div>

        <div class="grid min-h-0 flex-1 grid-cols-[1fr_1px_1fr]">
          <div>
            <div class="border-b border-default px-6 py-2 lg:px-8">
              <span class="font-mono text-xs text-dimmed">source</span>
            </div>
            <div class="h-[260px] overflow-auto p-6 lg:p-8">
              <pre class="font-mono text-sm/7 whitespace-pre-wrap text-default">{{ current.input }}</pre>
            </div>
          </div>

          <div class="bg-border" />

          <div>
            <div class="border-b border-default px-6 py-2 lg:px-8">
              <span class="font-mono text-xs text-dimmed">rendered output</span>
            </div>
            <div class="h-[260px] overflow-auto p-6 lg:p-8">
              <ComarkDocs
                :key="current.id"
                class="prose prose-sm max-w-none dark:prose-invert"
                :markdown="current.input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
