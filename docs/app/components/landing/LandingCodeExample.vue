<script setup lang="ts">
const activeTab = ref('vue')

const tabs = [
  { id: 'vue', label: 'Vue', icon: 'i-logos-vue' },
  { id: 'react', label: 'React', icon: 'i-logos-react' },
]
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-2 mb-6 justify-center">
      <UButton
        v-for="tab in tabs"
        :key="tab.id"
        :variant="activeTab === tab.id ? 'solid' : 'soft'"
        color="neutral"
        :icon="tab.icon"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </UButton>
    </div>
    <div v-show="activeTab === 'vue'">
      <slot name="vue" />
    </div>
    <div v-show="activeTab === 'react'">
      <slot name="react" />
    </div>
  </div>
</template>
