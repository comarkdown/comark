# AI SDK + Comark — Nuxt example

A minimal Nuxt chat app showing how to stream AI-generated Comark content in real time using the [Vercel AI SDK](https://sdk.vercel.ai).

- **`server/api/chat.post.ts`** — `streamText` with two tools: `fetchComarkSkill` (loads the Comark syntax reference) and `fetchComponents` (lists available UI components), so the model knows how to use both before responding
- **`app/components/Alert.vue`** — the only custom component registered in the renderer
- **`app/pages/index.vue`** — `Chat` from `@ai-sdk/vue` + `<Comark :streaming="isPartStreaming(part)" caret>` for live per-part rendering 

## Setup

```bash
cp .env.example .env
# Add your AI_GATEWAY_API_KEY

pnpm install
pnpm dev
```

## How it works

The server allows the model to call tools before producing its final response. On the client, `<Comark>` parses and renders the content as it arrives and receives `:streaming="isPartStreaming(part)"` for accurate per-part streaming state.

The `fetchComponents` tool returns a hardcoded string for simplicity, but in a real app it could do much more — fetch a JSON schema of your design system, read component source files to extract props and slots, call a registry API, or statically analyse your `components/` directory. The richer the description you give the model, the better it uses your components.
