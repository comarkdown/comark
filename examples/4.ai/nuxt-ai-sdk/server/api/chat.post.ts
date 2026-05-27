import { convertToModelMessages, streamText } from 'ai'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: `You are a helpful Comark assistant. Always respond using Comark syntax.
Call fetchComarkSkill to learn the syntax and fetchComponents to discover available UI components.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(4),
  })

  return result.toUIMessageStreamResponse()
})
