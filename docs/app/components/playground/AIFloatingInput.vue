<script setup lang="ts">
const props = defineProps<{
  isGenerating: boolean
}>()

const emit = defineEmits<{
  submit: [prompt: string, mode: 'nuxt-ui' | 'showcase']
}>()

const input = ref('')
const mode = defineModel<'nuxt-ui' | 'showcase'>('mode', { default: 'nuxt-ui' })

const modes = [
  { value: 'nuxt-ui', label: 'Nuxt UI components' },
  { value: 'showcase', label: 'Playground components' },
] as const

function handleSubmit() {
  if (!input.value.trim() || props.isGenerating) return
  emit('submit', input.value.trim(), mode.value)
  input.value = ''
}
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-6 z-10 px-4 flex justify-center">
    <div class="pointer-events-auto w-full max-w-96 flex flex-col items-center gap-2">
      <div class="flex items-center gap-1 bg-default border border-default rounded-lg px-1 py-1 shadow-sm">
        <button
          v-for="m in modes"
          :key="m.value"
          class="px-3 py-0.5 rounded-md text-xs font-medium transition-colors"
          :class="mode === m.value
            ? 'bg-primary text-inverted'
            : 'text-muted hover:text-default'"
          @click="mode = m.value"
        >
          {{ m.label }}
        </button>
      </div>

      <form
        class="w-full"
        @submit.prevent="handleSubmit"
      >
        <UInput
          v-model="input"
          placeholder="Describe the page you want to generate…"
          size="lg"
          maxlength="1000"
          :disabled="isGenerating"
          :ui="{
            root: 'group w-full! min-w-0 transition-all duration-300 ease-out [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:focus-within:scale-105',
            base: 'bg-default shadow-lg rounded-xl text-base',
            trailing: 'pe-2',
          }"
          @keydown.enter.exact.prevent="handleSubmit"
        >
          <template #trailing>
            <UButton
              type="submit"
              color="primary"
              size="xs"
              :disabled="!input.trim() || isGenerating"
            >
              <template #leading>
                <UIcon
                  :name="isGenerating ? 'i-lucide-loader-circle' : 'i-lucide-arrow-up'"
                  :class="isGenerating ? 'animate-spin' : ''"
                />
              </template>
            </UButton>
          </template>
        </UInput>
      </form>
    </div>
  </div>
</template>
