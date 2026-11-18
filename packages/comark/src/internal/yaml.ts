import { dump, JSON_SCHEMA, loadAll, YAMLException, type DumpOptions } from 'js-yaml'

/** Parse a single YAML document, or return `undefined` when empty. */
export function parseYaml(content: string): Record<string, unknown> | undefined {
  const documents = loadAll(content, { schema: JSON_SCHEMA }) as Record<string, unknown>[]
  // Preserve `load()`'s single-document guard rather than silently taking the first.
  if (documents.length > 1) {
    throw new YAMLException('expected a single document in the stream, but found more')
  }
  return documents[0]
}

/** Stringify data as YAML without quoting colon-prefixed keys. */
export function stringifyYaml(data: Record<string, unknown>, options?: DumpOptions): string {
  const yamlOutput = dump(data, {
    indent: 2,
    lineWidth: -1,
    ...options,
  })

  // js-yaml quotes keys starting with `:` (`':test': true` -> `:test: true`);
  // stripping those quotes is faster than switching YAML libraries.
  const lines = yamlOutput.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()

    if (trimmed[0] === "'" || trimmed[0] === '"') {
      const quote = trimmed[0]
      if (trimmed[1] === ':') {
        const quoteEnd = trimmed.indexOf(quote, 1)
        if (quoteEnd > 1 && trimmed[quoteEnd + 1] === ':') {
          const indent = line.length - trimmed.length
          lines[i] = ' '.repeat(indent) + trimmed.slice(1, quoteEnd) + trimmed.slice(quoteEnd + 1)
        }
      }
    }
  }
  return lines.join('\n')
}
