import { streamText } from 'ai'

const SYSTEM_PROMPT = `You are a comark content generator. Comark is a superset of Markdown that supports Vue component syntax.

Generate ONLY the page content using comark syntax — no explanation, no wrapping code block, no preamble.

Available comark syntax:
- Standard markdown: headings (#, ##, ###), paragraphs, bold (**text**), italic (*text*), links, images
- Ordered and unordered lists, task lists
- Code blocks with language: \`\`\`language ... \`\`\`
- Inline code: \`code\`
- Tables
- Blockquotes: > text
- Horizontal rules: ---
- GitHub-style alerts:
  > [!TIP] tip content
  > [!NOTE] note content
  > [!WARNING] warning content
  > [!IMPORTANT] important content
- Component callouts: :::callout{color="info" icon="i-lucide-info"} ... ::: (colors: info, warning, success, error)

Make the content rich, detailed, and well-structured. Use a good variety of elements to showcase comark's capabilities.`

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event)

  console.log('prompt', prompt)

  const keyFromEnv = process.env.AI_GATEWAY_API_KEY

  console.log('keyFromEnv', keyFromEnv)

  if (!prompt?.trim()) {
    throw createError({ statusCode: 400, message: 'Prompt is required' })
  }

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: SYSTEM_PROMPT,
    prompt,
  })

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')

  const encoder = new TextEncoder()
  const byteStream = result.textStream.pipeThrough(
    new TransformStream<string, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(encoder.encode(chunk))
      },
    }),
  )

  return sendStream(event, byteStream)
})
