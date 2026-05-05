import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import type { ComponentRegistry, ComponentSchema } from '../types/schema'

function isJsonSchema7(def: JSONSchema7Definition): def is JSONSchema7 {
  return typeof def === 'object'
}

/** Renders an array of component registry entries as a Markdown reference block suitable for inclusion in an AI system prompt. */
export function schemaToMarkdown(components: ComponentSchema[]): string {
  return components
    .map((c) => {
      const lines: string[] = [`### ${c.title} — ${c.description}`]
      const propEntries = Object.entries(c.properties ?? {}).filter((entry): entry is [string, JSONSchema7] =>
        isJsonSchema7(entry[1])
      )
      if (propEntries.length) {
        const required = c.required ?? []
        const propList = propEntries
          .map(([name, prop]) => {
            const type = Array.isArray(prop.type) ? prop.type.join('|') : (prop.type ?? 'any')
            const isRequired = required.includes(name)
            const defaultPart = prop.default !== undefined ? `, default: ${prop.default}` : ''
            return `- \`${name}\` (${type}${isRequired ? ', required' : ''}${defaultPart}): ${prop.description ?? ''}`
          })
          .join('\n')
        lines.push(`\nProps:\n${propList}`)
      }
      if (c['x-slots'].length) {
        const slotList = c['x-slots'].map((s) => `- \`#${s.name}\`: ${s.description}`).join('\n')
        lines.push(`\nSlots:\n${slotList}`)
      }
      lines.push(`\n\`\`\`\n${c['x-example']}\n\`\`\``)
      return lines.join('\n')
    })
    .join('\n\n')
}

/** Builds the system prompt for showcase mode, injecting the live component registry. */
export async function buildShowcasePrompt(base: string): Promise<string> {
  const componentsBlock = await loadInternalComponents()
  return [
    base,
    '\nBefore generating, call fetchComarkSkill to retrieve Comark component syntax, slots, and props.',
    componentsBlock,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Loads playground components from the server asset registry and returns a formatted markdown block for AI prompt injection. */
async function loadInternalComponents(): Promise<string> {
  const storage = useStorage('assets:server')
  const schema = await storage.getItem<ComponentRegistry>('components/schema.json')
  if (!schema?.playgroundComponents?.length) return ''
  return `## CUSTOM COMPONENTS\n\nThe following components are available in this playground. Do not call fetchSkill for them.\n\n${schemaToMarkdown(schema.playgroundComponents)}`
}
