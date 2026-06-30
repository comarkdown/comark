---
title: AI SDK
description: Streaming AI chat with live Comark rendering
navigation:
  icon: i-simple-icons-vercel
category: AI
path: /examples/ai/nuxt-ai-sdk
---

::code-explorer
---
org: comarkdown
repo: comark
branch: feat/aisdk-nuxt-example
path: examples/4.ai/nuxt-ai-sdk
defaultValue: server/api/chat.post.ts
---
::

## How it works

- **`server/api/chat.post.ts`** — `streamText` to stream the Markdown response from the model
- **`app/pages/index.vue`** — `Chat` from `@ai-sdk/vue` + `<Comark :streaming="isPartStreaming(part)" caret>` for live per-part rendering

On the client, `<Comark>` parses and renders the Markdown response and receives `:streaming="isPartStreaming(part)"` for accurate per-part streaming state.

## Setup

```bash
cp .env.example .env
# Add your AI_GATEWAY_API_KEY

pnpm install
pnpm dev
```
