<script setup lang="ts">
definePageMeta({
  layout: 'docs',
})

// Fetch all examples
const { data: examples } = await useAsyncData('examples-list', () =>
  queryCollection('examples')
    .select('title', 'description', 'category', 'path', 'navigation')
    .all(),
)

// Group examples by category
const groupedExamples = computed(() => {
  if (!examples.value) return {}

  const groups: Record<string, typeof examples.value> = {}

  for (const example of examples.value) {
    const category = example.category || 'Other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(example)
  }

  return groups
})

const title = 'Examples'
const description = 'Explore Comark examples to learn how to add Comark in your projects'
useSeoMeta({
  title,
  description,
})
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
    />
    <UPageBody>
      <div
        v-for="(categoryExamples, category) in groupedExamples"
        :key="category"
        class="mb-12"
      >
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          {{ String(category).charAt(0).toUpperCase() + String(category).slice(1) }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UPageCard
            v-for="example in categoryExamples"
            :key="example.path"
            :to="example.path.replace(/\/readme$/i, '')"
            :title="example.title"
            :description="example.description"
          >
            <template #header>
              <UIcon
                v-if="example.navigation?.icon?.startsWith('i-')"
                :name="example.navigation?.icon"
                class="size-6"
              />
              <span
                v-else-if="example.icon"
                class="--ui-primary: green"
                v-html="example.icon"
              />
            </template>
          </UPageCard>
        </div>
      </div>

      <div
        v-if="!examples?.length"
        class="text-center py-12"
      >
        <UIcon
          name="i-lucide-book-dashed"
          class="size-12 text-muted mx-auto mb-4"
        />
        <p class="text-muted">
          No examples
        </p>
      </div>
    </UPageBody>
  </UPage>
</template>
