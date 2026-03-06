<script setup lang="ts">
import loader from '@monaco-editor/loader'
import { language as mdc } from '@nuxtlabs/monarch-mdc'

const {
  language = 'mdc',
  readOnly = false,
  fontSize = 14,
} = defineProps<{
  language?: string
  readOnly?: boolean
  fontSize?: number
}>()

const model = defineModel<string>({
  type: String,
  required: true,
})

const editorContainer = useTemplateRef('editorContainer')
let editor: any = null
let monaco: any | null = null
const colorMode = useColorMode()
const theme = computed<string>(() => colorMode.value === 'dark' ? 'vs-dark' : 'vs-light')
const loaded = ref(false)

onMounted(async () => {
  monaco = await loader.init()

  // Register the MDC language
  monaco.languages.register({ id: 'mdc' })
  monaco.languages.setMonarchTokensProvider('mdc', mdc)

  editor = monaco.editor.create(editorContainer.value, {
    value: model.value,
    language: language,
    theme: theme.value,
    automaticLayout: true,
    readOnly: readOnly,
    minimap: {
      enabled: false,
    },
    fontSize,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    roundedSelection: false,
    padding: {
      top: 8,
    },
    bracketPairColorization: {
      enabled: true,
    },
    formatOnPaste: true,
    formatOnType: true,
  })

  editor.onDidChangeModelContent(() => {
    model.value = editor.getValue()
  })

  monaco.editor.setTheme(theme.value)
  loaded.value = true
})

onBeforeUnmount(() => {
  editor?.dispose()
})

watch(model, (newCode) => {
  if (editor && editor.getValue() !== newCode) {
    editor.setValue(newCode)
  }
})

watch(() => language, (newLanguage) => {
  if (monaco && editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage === 'vue' ? 'mdc' : newLanguage)
    }
  }
})

watch(theme, (newTheme) => {
  if (monaco) {
    monaco.editor.setTheme(newTheme)
  }
})
</script>

<template>
  <div class="relative h-full w-full bg-white dark:bg-[#1e1e1e]">
    <div
      v-if="!loaded"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-6 animate-spin text-primary"
      />
      <span class="text-sm">Loading editor...</span>
    </div>
    <div
      ref="editorContainer"
      class="h-full w-full"
    />
  </div>
</template>
