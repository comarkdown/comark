import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateText, Output } from 'ai'
import { z } from 'zod'

const __dirname = dirname(fileURLToPath(import.meta.url))
const proseDir = join(__dirname, '../app/components/prose')
const playgroundDir = join(__dirname, '../app/components/playground')
const outputPath = join(__dirname, '../server/assets/components/schema.json')

const JsonSchemaProperty = z.object({
  type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object']),
  description: z.string(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
})

const ComponentSlot = z.object({
  name: z.string().describe('Slot name — "default" for the unnamed default slot'),
  description: z.string().describe('What content goes in this slot'),
})

const Component = z.object({
  title: z.string().describe('Component name in PascalCase, e.g. "CodeExplorer"'),
  description: z.string().describe('What the component does and when to use it'),
  'x-tag': z.string().describe('Lowercase kebab-case tag used in markdown, e.g. "code-explorer"'),
  'x-slots': z.array(ComponentSlot).describe('Named and default slots exposed by the component'),
  'x-example': z.string().describe('A realistic markdown usage example using Comark component syntax'),
  type: z.literal('object'),
  required: z.array(z.string()).describe('Names of required props'),
  properties: z.record(z.string(), JsonSchemaProperty).describe('JSON Schema properties for each prop'),
})

const Schema = z.object({
  $schema: z.literal('https://json-schema.org/draft/2020-12/schema'),
  title: z.literal('Comark Component Registry'),
  proseComponents: z.array(Component),
  playgroundComponents: z.array(Component),
  generatedAt: z.string(),
})

const SYSTEM = `You are a documentation extractor for Vue prose components used in a Comark-based docs site.
Comark is a markdown renderer that supports custom components via MDC syntax:
- Inline: \`:component-name{prop="value"}\`
- Block: \`::component-name{prop="value"}\nslot content\n::\`
- Block without props: \`::component-name\nslot content\n::\`
- Named slots: \`::component-name\n#slotName\ncontent\n::\`

Extract structured metadata from the Vue component source as a JSON Schema object:
- \`title\`: the filename without the \`.vue\` extension, exactly as provided
- \`x-tag\`: the kebab-case version of the filename without \`.vue\`, exactly as provided
- \`type\`: always "object"
- \`required\`: array of required prop names
- \`properties\`: JSON Schema properties for each prop (type, description, optional default)
- \`x-slots\`: named and default slots from the template
- \`x-example\`: realistic MDC usage example`

async function extractComponent(file: string, dir: string): Promise<z.infer<typeof Component>> {
  const source = await readFile(join(dir, file), 'utf-8')
  console.log(`Processing ${file}...`)

  const { output: result } = await generateText({
    model: 'anthropic/claude-sonnet-4.5',
    output: Output.object({ schema: Component }),
    system: SYSTEM,
    prompt: `Filename: \`${file}\`\n\n\`\`\`vue\n${source}\n\`\`\``,
  })

  return result
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const [proseFiles, playgroundFiles] = await Promise.all([
    readdir(proseDir).then((files) => files.filter((f) => f.endsWith('.vue'))),
    readdir(playgroundDir).then((files) =>
      files.filter((f) => f.endsWith('.vue') && !['AIFloatingInput.vue', 'GeneratingIndicator.vue'].includes(f))
    ),
  ])

  if (proseFiles.length === 0) {
    console.error(`No .vue files found in ${proseDir}`)
    process.exit(1)
  }

  const proseComponents: z.infer<typeof Component>[] = []
  for (const f of proseFiles) {
    proseComponents.push(await extractComponent(f, proseDir))
    await sleep(500)
  }

  const playgroundComponents: z.infer<typeof Component>[] = []
  for (const f of playgroundFiles) {
    playgroundComponents.push(await extractComponent(f, playgroundDir))
    await sleep(500)
  }

  const schema = Schema.parse({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Comark Component Registry',
    proseComponents,
    playgroundComponents,
    generatedAt: new Date().toISOString(),
  })

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(schema, null, 2))
  console.log(
    `\nGenerated schema with ${proseComponents.length} prose and ${playgroundComponents.length} playground component(s) → server/assets/components/schema.json`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
