import { dump, JSON_SCHEMA, load } from 'js-yaml'

/**
 * Parse YAML content
 * @param content - The content to parse
 * @returns The parsed data
 */
export function parseYaml(content: string): Record<string, unknown> {
  return load(content, { schema: JSON_SCHEMA }) as Record<string, unknown>
}

/**
 * Stringify YAML data
 * @param data - The data to stringify
 * @returns The stringified data
 */
export function stringifyYaml(data: Record<string, unknown>): string {
  const yamlOutput = dump(data, {
    indent: 2,
    replacer: (_key, value) => {
      if (value === 'true' || value === 'false') {
        return Boolean(value)
      }
      return value
    },
  })

  /**
   * js-yaml wraps keys with quotes if they start with a colon. This function removes the quotes.
   * `':test': true` becomes `:test: true`
   *
   * Using js-yaml and this function is faster than using other libraries like yaml.
   */
  const lines = yamlOutput.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()

    // Check if line starts with a quote followed by colon
    if (trimmed[0] === '\'' || trimmed[0] === '"') {
      const quote = trimmed[0]
      if (trimmed[1] === ':') {
        // Find the closing quote
        const quoteEnd = trimmed.indexOf(quote, 1)
        if (quoteEnd > 1 && trimmed[quoteEnd + 1] === ':') {
          // Remove quotes: keep indentation + unquoted key + rest
          const indent = line.length - trimmed.length
          lines[i] = ' '.repeat(indent) + trimmed.slice(1, quoteEnd) + trimmed.slice(quoteEnd + 1)
        }
      }
    }
  }
  return lines.join('\n')
}
