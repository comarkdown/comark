<script setup lang="ts">
const props = defineProps<{
  isGenerating: boolean
  prompt?: string
  floating?: boolean
}>()

const emit = defineEmits<{
  submit: [prompt: string]
}>()

const input = ref('')
const formRef = useTemplateRef<HTMLFormElement>('formRef')

function focusInput() {
  const el = formRef.value?.querySelector<HTMLInputElement>('input')
  if (!el) return
  el.focus()
  nextTick(() => el.select())
}

watch(
  () => props.prompt,
  () => {
    input.value = ''
  }
)

function handleFocus(e: FocusEvent) {
  if (!input.value) {
    input.value = props.prompt ?? ''
  }
  const el = e.target as HTMLInputElement
  nextTick(() => el.select())
}

function handleSubmit() {
  if (!input.value.trim() || props.isGenerating) return
  emit('submit', input.value.trim())
  input.value = ''
}
</script>

<template>
  <div
    :class="floating ? 'pointer-events-none absolute inset-x-0 bottom-6 z-10 px-4 flex justify-center' : 'flex-1'"
    @click="focusInput"
  >
    <form
      ref="formRef"
      :class="floating ? 'pointer-events-auto w-full max-w-96' : 'flex-1 flex items-center gap-1'"
      @submit.prevent="handleSubmit"
    >
      <UInput
        v-model="input"
        placeholder="Generate your own version and stream it with AI..."
        :size="floating ? 'lg' : 'sm'"
        maxlength="1000"
        :disabled="isGenerating"
        :class="!floating && 'flex-1'"
        :ui="
          floating
            ? {
                root: 'group w-full! min-w-0 transition-all duration-300 ease-out [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:focus-within:scale-105',
                base: 'bg-default shadow-lg rounded-xl text-base',
                trailing: 'pe-2',
              }
            : {}
        "
        @focus="handleFocus"
        @keydown.enter.exact.prevent="handleSubmit"
      >
        <template
          v-if="floating"
          #trailing
        >
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

      <UButton
        v-if="!floating"
        type="submit"
        color="primary"
        :disabled="!input.trim() || isGenerating"
      >
        <UIcon
          :name="isGenerating ? 'i-lucide-loader-circle' : 'i-lucide-arrow-up'"
          :class="isGenerating ? 'animate-spin' : ''"
        />
      </UButton>
    </form>
  </div>
</template>
