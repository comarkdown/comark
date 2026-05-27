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
  })

  return result.toUIMessageStreamResponse()
})
