import { streamText, tool, stepCountIs } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { z } from 'zod'
import { buildShowcasePrompt } from '../utils/prompt'

const COMARK_SKILL_URL = 'https://comark.dev/.well-known/skills/comark/references/markdown-syntax.md'

const NUXT_UI_SKILL_FILES = {
  'nuxt-ui-components': 'https://ui.nuxt.com/.well-known/skills/nuxt-ui/references/components.md',
  'nuxt-ui-component-selection':
    'https://ui.nuxt.com/.well-known/skills/nuxt-ui/references/guidelines/component-selection.md',
} as const

const BASE_PROMPT = `You are a Comark page generator. Comark is a superset of Markdown with component syntax (MDC — Markdown with Components), framework-agnostic with renderers for Vue, React, and Svelte.

IMPORTANT: Do NOT output any text before or between tool calls. Call fetchSkill tools silently. Your first output must be the page content itself — starting with the frontmatter \`---\` block.

Then generate ONLY the raw page content — no explanation, no wrapping code block, no preamble.

## RULES

- Always open with YAML frontmatter (title, description) and add \`page: { maxWidth: 1120px }\` for rich layout pages.
- NEVER USE \`---\` separators.
- NEVER use json-render blocks — use Comark component syntax exclusively
- Prefer named slots over props for any text content (ie description, title)
- Where it improves the visual, consider placing an image inside a slot instead of (or alongside) text.
- Mix element types: headings, lists, tables, components, callouts, steps

## IMAGE GUIDELINES

- Unsplash: \`https://images.unsplash.com/photo-{id}?w=800&h=400&fit=crop&q=80\`
- Picsum: \`https://picsum.photos/seed/{word}/{width}/{height}\``

const NUXT_UI_PROMPT = `${BASE_PROMPT}

## NUXT UI RULES

- **Always use the \`U\` prefix for Nuxt UI components** (e.g. \`UButton\`, \`UPageHero\`, \`UPageCard\`) — never drop the prefix (e.g. never \`Button\`, \`PageHero\`). This rule only applies for NON PROSE components.

Before generating, call both fetchComarkSkill and fetchNuxtUISkill to retrieve the documentation you need. Always fetch:
- fetchComarkSkill — Comark component syntax, slots, props
- fetchNuxtUISkill with nuxt-ui-components — available components (Steps, Callout, Badge, etc.)`

export default defineEventHandler(async (event) => {
  const { prompt, mode = 'nuxt-ui', structure } = await readBody(event)

  if (!prompt?.trim()) {
    throw createError({ statusCode: 400, message: 'Prompt is required' })
  }

  const systemPrompt = mode === 'showcase' ? await buildShowcasePrompt(BASE_PROMPT) : NUXT_UI_PROMPT

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: systemPrompt,
    prompt,
    stopWhen: stepCountIs(5),
    tools: {
      fetchComarkSkill: tool({
        description:
          'Fetch the Comark MDC syntax reference — component syntax, slots, and props. Call this before generating in any mode.',
        inputSchema: z.object({}),
        execute: async () => {
          const response = await fetch(COMARK_SKILL_URL)
          if (!response.ok) return `Failed to fetch comark skill: ${response.status}`
          return response.text()
        },
      }),
      ...(mode === 'nuxt-ui'
        ? {
            fetchNuxtUISkill: tool({
              description: 'Fetch Nuxt UI documentation to understand available components and when to use them.',
              inputSchema: z.object({
                skill: z
                  .enum(['nuxt-ui-components', 'nuxt-ui-component-selection'])
                  .describe('The Nuxt UI skill file to fetch'),
              }),
              execute: async ({ skill }) => {
                const url = NUXT_UI_SKILL_FILES[skill]
                const response = await fetch(url)
                if (!response.ok) return `Failed to fetch ${skill}: ${response.status}`
                return response.text()
              },
            }),
          }
        : {}),
    },
  })

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')

  const encoder = new TextEncoder()
  // Buffer until frontmatter `---` is found — discards any preamble text from tool-call steps
  let preambleBuffer = ''
  let frontmatterFound = false
  const byteStream = result.textStream.pipeThrough(
    new TransformStream<string, Uint8Array>({
      transform(chunk, controller) {
        if (frontmatterFound) {
          controller.enqueue(encoder.encode(chunk))
          return
        }
        preambleBuffer += chunk
        const idx = preambleBuffer.indexOf('---')
        if (idx !== -1) {
          frontmatterFound = true
          controller.enqueue(encoder.encode(preambleBuffer.slice(idx)))
          preambleBuffer = ''
        }
      },
      flush(controller) {
        if (!frontmatterFound && preambleBuffer) {
          controller.enqueue(encoder.encode(preambleBuffer))
        }
      },
    })
  )

  return sendStream(event, byteStream)
})
