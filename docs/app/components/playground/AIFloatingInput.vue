<script setup lang="ts">
const props = defineProps<{
  isGenerating: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  submit: [prompt: string]
}>()

const input = ref(props.placeholder ?? '')

watch(() => props.placeholder, (val) => {
  input.value = val ?? ''
})

function selectAll(e: FocusEvent) {
  (e.target as HTMLInputElement).select()
}

function handleSubmit() {
  if (!input.value.trim() || props.isGenerating) return
  emit('submit', input.value.trim())
  input.value = ''
}
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-6 z-10 px-4 flex justify-center">
    <form
      class="pointer-events-auto w-full max-w-96"
      @submit.prevent="handleSubmit"
    >
      <UInput
        v-model="input"
        :placeholder="placeholder ?? 'Describe the page you want to generate…'"
        size="lg"
        maxlength="1000"
        :disabled="isGenerating"
        :ui="{
          root: 'group w-full! min-w-0 transition-all duration-300 ease-out [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:focus-within:scale-105',
          base: 'bg-default shadow-lg rounded-xl text-base',
          trailing: 'pe-2',
        }"
        @focus="selectAll"
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
</template>
