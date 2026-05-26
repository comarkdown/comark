import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai'

export default defineLazyEventHandler(async () => {
  return defineEventHandler(async (event) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event)

    const result = streamText({
      model: 'anthropic/claude-sonnet-4.6',
      system: 'You are a helpful assistant. Format responses with Markdown when useful (headings, lists, code blocks, etc.).',
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  })
})
