<script setup lang="ts">
type SyntaxType = 'hash' | 'asterisk' | 'colon' | 'bracket' | 'text'

interface TypedChar {
  char: string
  syntax: SyntaxType
}

const props = withDefaults(defineProps<{
  text: string
  speed?: number
  resolveDelay?: number
  resolve?: boolean
  loop?: boolean
  triggerOnView?: boolean
  tag?: string
}>(), {
  speed: 80,
  resolveDelay: 600,
  resolve: true,
  loop: false,
  triggerOnView: true,
  tag: 'span',
})

const typedIndex = ref(0)
const phase = ref<'idle' | 'typing' | 'paused' | 'resolved'>('idle')
const containerRef = ref<HTMLElement | null>(null)

let typingTimer: ReturnType<typeof setTimeout> | null = null
let resolveTimer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null

function classifySyntax(char: string): SyntaxType {
  if (char === '#') return 'hash'
  if (char === '*') return 'asterisk'
  if (char === ':') return 'colon'
  if (char === '[' || char === ']' || char === '{' || char === '}') return 'bracket'
  return 'text'
}

const typedChars = computed<TypedChar[]>(() => {
  const chars: TypedChar[] = []
  const visibleText = props.text.slice(0, typedIndex.value)
  for (let i = 0; i < visibleText.length; i++) {
    chars.push({
      char: visibleText[i]!,
      syntax: classifySyntax(visibleText[i]!),
    })
  }
  return chars
})

const showCaret = computed(() => phase.value === 'typing' || phase.value === 'paused')
const showRaw = computed(() => phase.value !== 'resolved')
const showResolved = computed(() => phase.value === 'resolved')

function startTyping() {
  if (phase.value === 'typing') return
  typedIndex.value = 0
  phase.value = 'typing'
  typeNext()
}

function typeNext() {
  if (typedIndex.value >= props.text.length) {
    phase.value = 'paused'
    if (props.resolve) {
      resolveTimer = setTimeout(() => {
        phase.value = 'resolved'
        if (props.loop) {
          setTimeout(() => startTyping(), 2000)
        }
      }, props.resolveDelay)
    }
    else if (props.loop) {
      setTimeout(() => startTyping(), 2000)
    }
    return
  }

  typedIndex.value++
  const jitter = props.speed + (Math.random() - 0.5) * props.speed * 0.4
  typingTimer = setTimeout(typeNext, jitter)
}

function cleanup() {
  if (typingTimer) clearTimeout(typingTimer)
  if (resolveTimer) clearTimeout(resolveTimer)
  if (observer) observer.disconnect()
}

onMounted(() => {
  if (!props.triggerOnView) {
    startTyping()
    return
  }

  if (!containerRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && phase.value === 'idle') {
          startTyping()
        }
      }
    },
    { threshold: 0.5 },
  )
  observer.observe(containerRef.value)
})

onUnmounted(cleanup)

watch(() => props.text, () => {
  cleanup()
  typedIndex.value = 0
  phase.value = 'idle'
})

defineExpose({ startTyping })
</script>

<template>
  <component
    :is="tag"
    ref="containerRef"
    class="typing-text inline"
  >
    <span
      v-if="showRaw"
      class="font-mono"
    >
      <span
        v-for="(tc, i) in typedChars"
        :key="i"
        :class="`syntax-${tc.syntax}`"
      >{{ tc.char }}</span>
      <span
        v-if="showCaret"
        class="caret"
      />
    </span>

    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
    >
      <slot
        v-if="showResolved"
        name="resolved"
      >
        <span>{{ text.replace(/^[#*:\s]+/, '').replace(/[*]+$/, '') }}</span>
      </slot>
    </Transition>
  </component>
</template>
