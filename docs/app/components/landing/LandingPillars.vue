<script setup lang="ts">
interface Pillar {
  icon: string
  title: string
  description: string
  to: string
}

defineProps<{
  headline?: string
  title: string
  description: string
  pillars: Pillar[]
}>()
</script>

<template>
  <section class="border-b border-default">
    <div class="p-6 lg:p-8">
      <span
        v-if="headline"
        class="section-label"
      >
        {{ headline }}
      </span>
      <h2 class="mt-4 text-2xl font-bold text-highlighted">
        {{ title }}
      </h2>
      <p class="mt-3 max-w-2xl text-base/7 text-muted">
        {{ description }}
      </p>
    </div>

    <div class="grid gap-px border-t border-default bg-(--ui-border) sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="pillar in pillars"
        :key="pillar.title"
        :to="pillar.to"
        class="group bg-default p-6 transition-colors hover:bg-muted/50"
      >
        <UIcon
          :name="pillar.icon"
          class="size-6 text-primary"
        />
        <h3 class="mt-3 font-semibold text-highlighted group-hover:text-primary">
          {{ pillar.title }}
        </h3>
        <p class="mt-2 text-sm/6 text-muted">
          {{ pillar.description }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>
