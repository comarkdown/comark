# Streaming AI chat with the Vercel AI SDK and Nuxt

This example streams AI chat responses in Nuxt with the Vercel AI SDK (`@ai-sdk/vue`) and renders each Markdown message part incrementally as tokens arrive.

## How it works

- **Server route (`server/api/chat.post.ts`)**: calls `streamText()` to stream a Markdown response from the model.
- **Client chat UI (`app/pages/index.vue`)**: pairs `Chat` from `@ai-sdk/vue` with `<Markdown :streaming="isPartStreaming(part)" :effects="effects">` (with `fade()` and `caret()` from `comark/stream`) so unterminated syntax auto-closes while a part is active and settles once that part finishes.

## Setup

```bash
cp .env.example .env
# Set AI_GATEWAY_API_KEY in .env

pnpm install
pnpm dev
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Vue AI chat guide](https://comark.dev/use-cases/vue-ai-chat)
