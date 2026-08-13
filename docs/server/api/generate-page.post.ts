import { streamText, tool, stepCountIs, createUIMessageStream, createUIMessageStreamResponse } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { z } from 'zod'
import { buildShowcasePrompt } from '../utils/prompt'

const COMARK_SKILL_URL = 'https://comark.dev/.well-known/skills/comark/references/markdown-syntax.md'

const NUXT_UI_SKILL_FILES = {
  'nuxt-ui-components': 'https://ui.nuxt.com/.well-known/skills/nuxt-ui/references/components.md',
  'nuxt-ui-component-selection':
    'https://ui.nuxt.com/.well-known/skills/nuxt-ui/references/guidelines/component-selection.md',
} as const

const BASE_PROMPT = `You are a Comark page generator. Comark is a superset of Markdown with component syntax (MDC, Markdown with Components), framework-agnostic with renderers for Vue, React, Svelte, and Angular.

IMPORTANT: Do NOT output any text before or between tool calls. Call fetchSkill tools silently. Your first output must be the page content itself, starting with the frontmatter \`---\` block.

Then generate ONLY the raw page content: no explanation, no wrapping code block, no preamble.

## RULES

- Always open with YAML frontmatter (title, description) and add \`page: { maxWidth: 1120px }\` for rich layout pages.
- NEVER USE \`---\` separators.
- NEVER use json-render blocks, use Comark component syntax exclusively
- NEVER use em-dashes (—) in prose. Use commas, colons, or periods instead.
- Prefer named slots over props for any text content (ie description, title)
- Where it improves the visual, consider placing an image inside a slot instead of (or alongside) text.
- Mix element types: headings, lists, tables, components, callouts, steps

## IMAGE GUIDELINES

- Unsplash: \`https://images.unsplash.com/photo-{id}?w=800&h=400&fit=crop&q=80\`
- Picsum: \`https://picsum.photos/seed/{word}/{width}/{height}\``

const NUXT_UI_PROMPT = `${BASE_PROMPT}

## NUXT UI RULES

- **Never use the \`U\` prefix** for Nuxt UI components (e.g. \`Button\`, \`PageHero\`, \`PageCard\`).
- You can use all the components within the **Elements** and **Page** sections of the Nuxt UI documentation. As well as all the Typography components.
- **Before using ANY Nuxt UI component**, call \`fetchComponentDoc\` with its kebab-case name to learn its exact props and slots. NEVER guess or invent slot names.
- Only use slot names that appear in the component's \`Slots\` interface. If a value is a prop (not a slot), pass it as an inline attribute.
- \`image\` is almost always a **prop**, not a slot. Pass it as \`image="url"\` unless the Slots interface explicitly lists \`#image\`.

Before generating, fetch the documentation you need:
1. fetchComarkSkill: Comark component syntax, slots, props
2. fetchNuxtUISkill with "nuxt-ui-components": discover available components
3. fetchComponentDoc for EACH component you plan to use: learn exact props and slots`

const FETCH_TIMEOUT_MS = 15_000

async function fetchSkillText(url: string): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!response.ok) return { ok: false, reason: `status ${response.status}` }
    return { ok: true, text: await response.text() }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'request failed' }
  }
}

export default defineEventHandler(async (event) => {
  const { prompt, mode = 'nuxt-ui', _structure } = await readBody(event)

  if (!prompt?.trim()) {
    throw createError({ statusCode: 400, message: 'Prompt is required' })
  }

  const systemPrompt = mode === 'showcase' ? await buildShowcasePrompt(BASE_PROMPT) : NUXT_UI_PROMPT

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: systemPrompt,
    prompt,
    stopWhen: stepCountIs(8),
    tools: {
      fetchComarkSkill: tool({
        description:
          'Fetch the Comark MDC syntax reference: component syntax, slots, and props. Call this before generating in any mode.',
        inputSchema: z.object({}),
        execute: async () => {
          const result = await fetchSkillText(COMARK_SKILL_URL)
          if (!result.ok) return `Failed to fetch comark skill: ${result.reason}`
          return result.text
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
                const result = await fetchSkillText(NUXT_UI_SKILL_FILES[skill])
                if (!result.ok) return `Failed to fetch ${skill}: ${result.reason}`
                return result.text
              },
            }),
            fetchComponentDoc: tool({
              description:
                'Fetch the full documentation for a specific Nuxt UI component to learn its exact props, slots, and usage examples. Pass the kebab-case component name (e.g. "blog-post", "page-card", "page-hero"). ALWAYS call this before using a component to avoid inventing props or slots that do not exist.',
              inputSchema: z.object({
                component: z.string().describe('Kebab-case component name, e.g. "blog-post", "page-hero", "page-card"'),
              }),
              execute: async ({ component }) => {
                const url = `https://ui.nuxt.com/raw/docs/components/${component}.md`
                const result = await fetchSkillText(url)
                if (!result.ok)
                  return `Component "${component}" not found (${result.reason}). Check the name and try again.`
                const text = result.text
                if (text.includes('title: Not Found') || !text.includes('## Usage'))
                  return `Component "${component}" not found. Check the kebab-case name and try again.`
                const usageStart = text.indexOf('\n## Usage')
                const themeStart = text.indexOf('\n## Theme')
                if (usageStart !== -1 && themeStart !== -1) {
                  return text.slice(usageStart, themeStart).trim()
                }
                return text
              },
            }),
          }
        : {}),
    },
  })

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const id = 'page'
      writer.write({ type: 'text-start', id })

      // Buffer until frontmatter `---` is found, discards any preamble text from tool-call steps
      let preambleBuffer = ''
      let frontmatterFound = false
      for await (const chunk of result.textStream) {
        if (frontmatterFound) {
          writer.write({ type: 'text-delta', id, delta: chunk })
          continue
        }
        preambleBuffer += chunk
        const idx = preambleBuffer.indexOf('---')
        if (idx !== -1) {
          frontmatterFound = true
          writer.write({ type: 'text-delta', id, delta: preambleBuffer.slice(idx) })
          preambleBuffer = ''
        }
      }
      if (!frontmatterFound && preambleBuffer) {
        writer.write({ type: 'text-delta', id, delta: preambleBuffer })
      }

      writer.write({ type: 'text-end', id })
    },
    onError: (error) => {
      console.error('[generate-page] generation failed:', error)
      return 'Generation failed'
    },
  })

  return createUIMessageStreamResponse({ stream })
})
