<script setup lang="ts">
import loader from '@monaco-editor/loader'
import { language as mdc } from '@nuxtlabs/monarch-mdc'

const { language = 'mdc', readOnly = false } = defineProps<{
  language?: string
  readOnly?: boolean
}>()

const model = defineModel<string>({
  type: String,
  required: true,
})

const editorContainer = useTemplateRef('editorContainer')
let editor: any = null
let monaco: any | null = null
const colorMode = useColorMode()
const CUSTOM_DARK_THEME = 'comark-dark'
const theme = computed<string>(() => (colorMode.value === 'dark' ? CUSTOM_DARK_THEME : 'vs-light'))
const loaded = ref(false)

function defineComarkDarkTheme(monaco: any): void {
  monaco.editor.defineTheme(CUSTOM_DARK_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0a0a0a',
      'editor.foreground': '#e5e5e5',
      'editor.lineHighlightBackground': '#17171700',
      'editor.lineHighlightBorder': '#ffffff08',
      'editor.selectionBackground': '#404040',
      'editor.inactiveSelectionBackground': '#26262680',
      'editorLineNumber.foreground': '#525252',
      'editorLineNumber.activeForeground': '#a3a3a3',
      'editorCursor.foreground': '#facc15',
      'editorIndentGuide.background': '#262626',
      'editorIndentGuide.activeBackground': '#404040',
      'editor.selectionHighlightBackground': '#26262680',
      'editorBracketMatch.background': '#40404040',
      'editorBracketMatch.border': '#525252',
      'editorWidget.background': '#0a0a0a',
      'editorWidget.border': '#171717',
      'editorSuggestWidget.background': '#0a0a0a',
      'editorSuggestWidget.border': '#171717',
      'editorSuggestWidget.selectedBackground': '#262626',
      'input.background': '#171717',
      'input.border': '#262626',
      'scrollbarSlider.background': '#26262680',
      'scrollbarSlider.hoverBackground': '#404040',
      'scrollbarSlider.activeBackground': '#525252',
    },
  })
}

onMounted(async () => {
  monaco = await loader.init()

  // Register the MDC language
  monaco.languages.register({ id: 'mdc' })
  monaco.languages.setMonarchTokensProvider('mdc', mdc)

  // Define custom dark theme matching the website
  defineComarkDarkTheme(monaco)

  editor = monaco.editor.create(editorContainer.value, {
    value: model.value,
    language: language,
    theme: theme.value,
    automaticLayout: true,
    readOnly: readOnly,
    minimap: {
      enabled: false,
    },
    fontSize: 14,
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

watch(
  () => language,
  (newLanguage) => {
    if (monaco && editor) {
      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage === 'vue' ? 'mdc' : newLanguage)
      }
    }
  }
)

watch(theme, (newTheme) => {
  if (monaco) {
    monaco.editor.setTheme(newTheme)
  }
})

defineExpose({
  scrollToBottom() {
    if (!editor) return
    const lineCount = editor.getModel()?.getLineCount() ?? 1
    editor.revealLine(lineCount)
  },
})
</script>

<template>
  <div class="relative h-full w-full bg-white dark:bg-[#0a0a0a]">
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
