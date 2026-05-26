import { convertToModelMessages, streamText, tool, stepCountIs } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { z } from 'zod'

const COMARK_SKILL_URL = 'https://comark.dev/.well-known/skills/comark/references/markdown-syntax.md'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: `You are a helpful Comark assistant. Always respond using Comark syntax.
Call fetchComarkSkill to learn the syntax and fetchComponents to discover available UI components.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(4),
    tools: {
      fetchComarkSkill: tool({
        description: 'Fetch the Comark MDC syntax reference — component syntax, slots, and props. Call this before generating rich responses.',
        inputSchema: z.object({}),
        execute: async () => {
          const response = await fetch(COMARK_SKILL_URL)
          if (!response.ok) return `Failed to fetch comark skill: ${response.status}`
          return response.text()
        },
      }),
      fetchComponents: tool({
        description: 'List all custom UI components available in this app. Call this to know which components you can use and how to use them.',
        inputSchema: z.object({}),
        execute: async () => `\
List of all the custom components available in this example:

## Alert

Use to highlight important information inline with your response.

With variants:

::alert{type="info"}
For informational messages
::

::alert{type="warning"}
For warnings
::

::alert{type="success"}
For success messages
::

::alert{type="error"}
For errors
::`,
      }),
    },
  })

  return result.toUIMessageStreamResponse()
})
