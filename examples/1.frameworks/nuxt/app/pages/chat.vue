<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { isTextUIPart } from 'ai'
import { isPartStreaming } from '@nuxt/ui/utils/ai'

useSeoMeta({
  title: 'Chat',
  description: 'A minimal AI chat with Comark markdown rendering.',
})

const input = ref('')
const chat = new Chat({})

function onSubmit() {
  chat.sendMessage({ text: input.value })
  input.value = ''
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
    <div class="shrink-0">
      <h1 class="text-3xl font-bold mb-2">
        Chat
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        Minimal AI chat with
        <a href="https://ai-sdk.dev/docs/getting-started/nuxt" class="underline">AI SDK</a>
        and
        <a href="https://comark.dev" class="underline">Comark</a>
        streaming markdown.
      </p>
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <UChatMessages
        should-auto-scroll
        :messages="chat.messages"
        :status="chat.status"
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        :ui="{ root: 'min-h-0' }"
      >
        <template #indicator>
          <UChatShimmer text="Thinking..." class="text-sm" />
        </template>

        <template #content="{ message }">
          <template
            v-for="(part, index) in message.parts"
            :key="`${message.id}-${part.type}-${index}`"
          >
            <template v-if="isTextUIPart(part)">
              <p v-if="message.role === 'user'" class="whitespace-pre-wrap">
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
        <template #footer>
          <UChatPromptSubmit
            :status="chat.status"
            color="neutral"
            size="sm"
            @stop="chat.stop()"
            @reload="chat.regenerate()"
          />
        </template>
      </UChatPrompt>
    </div>
  </div>
</template>
