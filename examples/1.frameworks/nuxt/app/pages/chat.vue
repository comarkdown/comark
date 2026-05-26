<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { isTextUIPart, type UIMessage } from 'ai'

useSeoMeta({
  title: 'Chat',
  description: 'A minimal AI chat with Comark markdown rendering.',
})

const input = ref('')

const chat = new Chat({})

function getMessageText(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map(part => part.text)
    .join('')
}

function isStreamingMessage(message: UIMessage) {
  return chat.status === 'streaming'
    && message.role === 'assistant'
    && message.id === chat.messages.at(-1)?.id
}

function handleSubmit(e: Event) {
  e.preventDefault()
  if (!input.value.trim()) return

  chat.sendMessage({ text: input.value })
  input.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4 min-h-[calc(100dvh-12rem)]">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        Chat
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        Minimal AI chat powered by the
        <a
          href="https://ai-sdk.dev/docs/getting-started/nuxt"
          class="underline"
        >AI SDK</a>
        with
        <a
          href="https://comark.dev"
          class="underline"
        >Comark</a>
        streaming markdown rendering.
      </p>
    </div>

    <div class="flex flex-1 flex-col gap-4 min-h-0">
      <UChatMessages
        should-auto-scroll
        :messages="chat.messages"
        :status="chat.status"
        :spacing-offset="120"
        class="flex-1 min-h-0"
      >
        <template #indicator>
          <UChatShimmer
            text="Thinking..."
            class="text-sm"
          />
        </template>

        <template #content="{ message }">
          <p
            v-if="message.role === 'user'"
            class="whitespace-pre-wrap"
          >
            {{ getMessageText(message) }}
          </p>

          <Suspense v-else>
            <Comark
              :markdown="getMessageText(message)"
              :streaming="isStreamingMessage(message)"
              caret
            />
          </Suspense>
        </template>
      </UChatMessages>

      <UChatPrompt
        v-model="input"
        :error="chat.error"
        variant="subtle"
        placeholder="Ask something…"
        @submit="handleSubmit"
      >
        <template #footer>
          <p class="text-xs text-muted">
            Requires <code>NUXT_AI_GATEWAY_API_KEY</code> in <code>.env</code>
          </p>

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
