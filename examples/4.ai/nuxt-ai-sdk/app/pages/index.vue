<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { isTextUIPart } from 'ai'
import { isPartStreaming } from '@nuxt/ui/utils/ai'

const chat = new Chat({})
const input = ref('')

function onSubmit() {
  chat.sendMessage({ text: input.value })
  input.value = ''
}
</script>

<template>
  <div class="max-w-2xl mx-auto flex flex-col h-screen p-6">
    <h1 class="text-xl font-semibold mb-6 shrink-0">AI SDK + Comark</h1>

    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <UChatMessages
        should-auto-scroll
        :messages="chat.messages"
        :status="chat.status"
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <template #indicator>
          <UChatShimmer
            text="Thinking..."
            class="text-sm"
          />
        </template>

        <template #content="{ message }">
          <template
            v-for="(part, index) in message.parts"
            :key="`${message.id}-${part.type}-${index}`"
          >
            <template v-if="isTextUIPart(part)">
              <p
                v-if="message.role === 'user'"
                class="whitespace-pre-wrap"
              >
                {{ part.text }}
              </p>
              <Suspense v-else>
                <Comark
                  :markdown="part.text"
                  :streaming="isPartStreaming(part)"
                  caret
                />
              </Suspense>
            </template>
          </template>
        </template>
      </UChatMessages>

      <UChatPrompt
        v-model="input"
        :error="chat.error"
        variant="subtle"
        placeholder="Ask something…"
        class="shrink-0"
        @submit="onSubmit"
      >
        <UChatPromptSubmit
          :status="chat.status"
          color="neutral"
          size="sm"
          class="self-center"
          @stop="chat.stop()"
          @reload="chat.regenerate()"
        />
      </UChatPrompt>
    </div>
  </div>
</template>
