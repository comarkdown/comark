---
title: 'Streaming AI Chat with the Vercel AI SDK and Nuxt'
description: 'A Nuxt chat app that streams Vercel AI SDK responses and renders the Markdown with Comark while each message is still arriving.'
navigation:
  title: AI SDK
  icon: i-simple-icons-vercel
---

::code-explorer
---
org: comarkdown
repo: comark@0f3eb651439f21739c7f7ce33843c5c607ade2c0
path: examples/4.ai/nuxt-ai-sdk
defaultValue: server/api/chat.post.ts
---
::

## How it works

- **`server/api/chat.post.ts`** — `streamText` to stream the Markdown response from the model
- **`app/pages/index.vue`** — `Chat` from `@ai-sdk/vue` + `<Markdown :streaming="isPartStreaming(part)" caret>` for live per-part rendering

On the client, `<Markdown>` parses and renders the Markdown response and receives `:streaming="isPartStreaming(part)"` for accurate per-part streaming state.

## Setup

```bash
cp .env.example .env
# Add your AI_GATEWAY_API_KEY

pnpm install
pnpm dev
```
