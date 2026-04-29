<script setup lang="ts">
const props = defineProps<{
  isGenerating: boolean
}>()

const emit = defineEmits<{
  submit: [prompt: string]
}>()

const input = ref('')

function handleSubmit() {
  if (!input.value.trim() || props.isGenerating) return
  emit('submit', input.value.trim())
  input.value = ''
}
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-6 z-10 px-4 sm:px-80 flex justify-center">
    <form
      class="pointer-events-none flex w-full justify-center"
      @submit.prevent="handleSubmit"
    >
      <div class="pointer-events-auto w-full max-w-96">
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
              :icon="isGenerating ? 'i-lucide-loader-circle' : 'i-lucide-arrow-up'"
              :ui="{ icon: isGenerating ? 'animate-spin' : '' }"
              color="primary"
              size="xs"
              :disabled="!input.trim() || isGenerating"
            />
          </template>
        </UInput>
      </div>
    </form>
  </div>
</template>
