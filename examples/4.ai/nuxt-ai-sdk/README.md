---
title: AI SDK
description: Streaming AI chat with live Comark rendering — server tools teach the model comark syntax and available components before responding.
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

- **`server/api/chat.post.ts`** — `streamText` with two tools: `fetchComarkSkill` (loads the Comark syntax reference) and `fetchComponents` (lists available UI components), so the model knows how to use both before responding
- **`app/components/Alert.vue`** — the only custom component registered in the renderer
- **`app/pages/index.vue`** — `Chat` from `@ai-sdk/vue` + `<Comark :streaming="isPartStreaming(part)" caret>` for live per-part rendering

The server uses `stopWhen: stepCountIs(4)` to allow the model to call tools before producing its final response. On the client, `<Comark>` is wrapped in `<Suspense>` (required because `Comark.setup` is async) and receives `:streaming="isPartStreaming(part)"` for accurate per-part streaming state.

The `fetchComponents` tool returns a hardcoded string for simplicity. In a real app it could fetch a JSON schema of your design system, read component source files to extract props and slots, call a registry API, or statically analyse your `components/` directory — the richer the description, the better the model uses your components.

## Setup

```bash
cp .env.example .env
# Add your AI_GATEWAY_API_KEY

pnpm install
pnpm dev
```
