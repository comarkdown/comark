import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'

const SKILL_FILES = {
  'comark-markdown-syntax': 'https://comark.dev/.well-known/skills/comark/references/markdown-syntax.md',
  'nuxt-ui-components': 'https://ui.nuxt.com/.well-known/skills/nuxt-ui/references/components.md',
  'nuxt-ui-component-selection': 'https://ui.nuxt.com/.well-known/skills/nuxt-ui/references/guidelines/component-selection.md',
} as const

const BASE_PROMPT = `You are a Comark page generator. Comark is a superset of Markdown that supports Vue component syntax.

IMPORTANT: Do NOT output any text before or between tool calls. Call fetchSkill tools silently. Your first output must be the page content itself — starting with the frontmatter \`---\` block.

Then generate ONLY the raw page content — no explanation, no wrapping code block, no preamble.`

const NUXT_UI_PROMPT = `${BASE_PROMPT}

Before generating, call the fetchSkill tool to retrieve the documentation you need. Always fetch:
- comark-markdown-syntax — Comark component syntax, slots, props
- nuxt-ui-components — available components (Steps, Callout, Badge, etc.)

## RULES

- Always open with YAML frontmatter (title, description).
- NEVER use json-render blocks — use Comark component syntax exclusively
- Use real, plausible content — names, prices, places, measurements
- Mix element types: headings, lists, tables, components, callouts, steps
- Keep pages concise: 80–150 lines of comark source (roughly 2 viewport scrolls)
- **Prefer named slots over props for any text content.** Only use props for scalar values (booleans, numbers, icon names). Put titles, descriptions, and body content in slots.
- Where it improves the visual, consider placing an image inside a slot instead of (or alongside) text — e.g. a photo in a description slot or a cover image in a header slot.
- **Never write \`**N.\`** (bold opening immediately followed by a digit and period) — use \`1. **text**\` or a heading instead. The pattern \`*N.\` is reserved parser syntax and will cause a parse error.
- **Never use Markdown tables** — they cause parse errors. Use bullet lists, numbered lists, or definition-style prose instead.

## IMAGE GUIDELINES

- Unsplash: \`https://images.unsplash.com/photo-{id}?w=800&h=400&fit=crop&q=80\`
- Picsum: \`https://picsum.photos/seed/{word}/{width}/{height}\``

const SHOWCASE_PROMPT = `${BASE_PROMPT}

Before generating, call the fetchSkill tool to retrieve:
- comark-markdown-syntax — Comark component syntax, slots, props

## CUSTOM COMPONENTS

These playground-specific components are available — no need to fetch them.

### Gallery — image gallery

Full-width cover image:
\`\`\`
::Gallery{cover}
![Alt](https://images.unsplash.com/photo-xxx?w=1200&h=600&fit=crop)
::
\`\`\`

Multi-image grid (main + thumbnails):
\`\`\`
::Gallery
#main
![Main](https://picsum.photos/seed/main/800/500)

#thumbnails
![A](https://picsum.photos/seed/a/400/300)
![B](https://picsum.photos/seed/b/400/300)
![C](https://picsum.photos/seed/c/400/300)
![D](https://picsum.photos/seed/d/400/300)
::
\`\`\`

### RatingBar — star rating with label

\`\`\`
::RatingBar{rating="4.5" reviews="128"}
#title
Community favourite

#description
One of the most loved listings, according to guests.
::
\`\`\`

Props: \`rating\` (0–5 float as string), \`reviews\` (number as string)

### Facility — icon + label row

\`\`\`
::Facility{icon="i-lucide-wifi"}
#title
Free Wi-Fi

#description
High-speed internet throughout the property.
::
\`\`\`

Props: \`icon\` — any Lucide icon in \`i-lucide-xxx\` format

### TwoColumn — two-column layout

\`\`\`
::TwoColumn
#left
Main prose content...

#right
:::BookingCard{title="From $180 / night" cta="Check availability"}
:::
::
\`\`\`

Left is full prose. Right is a 320px sticky sidebar on desktop.

### BookingCard — interactive booking widget

Used inside TwoColumn's \`#right\` slot. Includes a date-range picker and guest counter.

\`\`\`
:::BookingCard{title="From $180 / night" cta="Check availability"}
:::
\`\`\`

Props: \`title\` (price or headline), \`cta\` (button label)

### HostInfo — host profile row

\`\`\`
::HostInfo{name="Sophie" badge="Superhost" duration="3 years hosting"}
::
\`\`\`

Props: \`name\` (required), \`badge\` (optional), \`duration\` (optional)

### Ingredients — ingredient list with servings counter

\`\`\`
::Ingredients{title="Ingredients" servings="4" :items='[{"image":"https://picsum.photos/seed/flour/100/100","quantity":"200 g","name":"Flour"},{"image":"https://picsum.photos/seed/eggs/100/100","quantity":"3","name":"Eggs"}]'}
::
\`\`\`

Props: \`title\`, \`servings\` (number), \`items\` (JSON array of \`{ image, quantity, name }\`)

---

## RULES

- Always open with YAML frontmatter (title, description). Add \`page: { maxWidth: 1120px }\` for rich layout pages.
- NEVER use json-render blocks — use Comark component syntax exclusively (e.g. \`::HostInfo{name="Sophie" badge="Superhost"}\`)
- Use real, plausible content — names, prices, places, measurements
- Mix element types: headings, lists, tables, components
- Keep pages concise: 80–150 lines of comark source (roughly 2 viewport scrolls)
- **Prefer named slots over props for any text content.** Only use props for scalar values (booleans, numbers, icon names). Put titles, descriptions, and body content in slots.
- Where it improves the visual, consider placing an image inside a slot instead of (or alongside) text — e.g. a photo in a description slot or a cover image in a header slot.
- **Never write \`**N.\`** (bold opening immediately followed by a digit and period) — use \`1. **text**\` or a heading instead. The pattern \`*N.\` is reserved parser syntax and will cause a parse error.
- **Never use Markdown tables** — they cause parse errors. Use bullet lists, numbered lists, or definition-style prose instead.

## IMAGE GUIDELINES

- Unsplash: \`https://images.unsplash.com/photo-{id}?w=800&h=400&fit=crop&q=80\`
- Picsum: \`https://picsum.photos/seed/{word}/{width}/{height}\`
- Square crops (\`w=100&h=100\`) for thumbnails`

export default defineEventHandler(async (event) => {
  const { prompt, mode = 'nuxt-ui' } = await readBody(event)

  if (!prompt?.trim()) {
    throw createError({ statusCode: 400, message: 'Prompt is required' })
  }

  const systemPrompt = mode === 'showcase' ? SHOWCASE_PROMPT : NUXT_UI_PROMPT

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: systemPrompt,
    prompt,
    stopWhen: stepCountIs(5),
    tools: {
      fetchSkill: tool({
        description: 'Fetch documentation from a Comark and Nuxt UI skill file to understand available syntax and components before generating content.',
        inputSchema: z.object({
          skill: z.enum(['comark-markdown-syntax', 'nuxt-ui-components', 'nuxt-ui-component-selection']).describe('The skill file to fetch'),
        }),
        execute: async ({ skill }) => {
          const url = SKILL_FILES[skill]
          const response = await fetch(url)
          if (!response.ok) return `Failed to fetch ${skill}: ${response.status}`
          return response.text()
        },
      }),
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
    }),
  )

  return sendStream(event, byteStream)
})
