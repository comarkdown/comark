<script setup>
import { ref, onMounted, watch } from 'vue'
import loader from '@monaco-editor/loader'
import { language as mdc } from '@nuxtlabs/monarch-mdc'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'mdc',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const editorContainer = ref(null)
let editor = null
const colorMode = useColorMode()
const theme = computed(() => {
  return colorMode.value === 'dark' ? 'vs-dark' : 'vs-light'
})

onMounted(async () => {
  const monaco = await loader.init()

  // Register the MDC language
  monaco.languages.register({ id: 'mdc' })
  monaco.languages.setMonarchTokensProvider('mdc', mdc)

  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: theme.value,
    automaticLayout: true,
    readOnly: props.readOnly,
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
    emit('update:modelValue', editor.getValue())
  })

  monaco.editor.setTheme(theme.value)
})

watch(() => props.modelValue, (newCode) => {
  if (editor && editor.getValue() !== newCode) {
    editor.setValue(newCode)
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage === 'vue' ? 'mdc' : newLanguage)
    }
  }
})

watch(() => theme.value, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
})
</script>

<template>
  <div
    ref="editorContainer"
    class="h-full w-full"
  />
</template>
