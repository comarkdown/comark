---
title: 'Streaming AI Chat with the Vercel AI SDK and Nuxt'
description: 'A Nuxt chat app that streams Vercel AI SDK responses and renders each Markdown message part live with Comark.'
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

This example streams AI chat responses in Nuxt with the Vercel AI SDK (`@ai-sdk/vue`) and renders each text part incrementally as tokens arrive.

## How it works

- **Server route (`server/api/chat.post.ts`)**: calls `streamText()` to stream a Markdown response from the model.
- **Client chat UI (`app/pages/index.vue`)**: pairs `Chat` from `@ai-sdk/vue` with `<Markdown :streaming="isPartStreaming(part)" :effects="effects">` with a `caret()` effect from `comark/effects`, so unterminated syntax auto-closes while a part is active and settles once that part finishes.

## Setup

```bash
cp .env.example .env
# Set AI_GATEWAY_API_KEY in .env

pnpm install
pnpm dev
```
