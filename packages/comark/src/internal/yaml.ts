import { dump, JSON_SCHEMA, loadAll, YAMLException, type DumpOptions } from 'js-yaml'

/**
 * Parse YAML content.
 *
 * @param content - The content to parse
 * @returns The parsed data, or `undefined` when the content has no YAML document
 */
export function parseYaml(content: string): Record<string, unknown> | undefined {
  const documents = loadAll(content, { schema: JSON_SCHEMA }) as Record<string, unknown>[]
  // Preserve `load()`'s single-document guard rather than silently taking the first.
  if (documents.length > 1) {
    throw new YAMLException('expected a single document in the stream, but found more')
  }
  return documents[0]
}

/**
 * A markdown-it token attr must be a string. This prefix marks a string as an
 * encoded value, so it can round-trip back to its real type.
 *
 * The prefix starts with a NUL byte. `encodeYamlTypedValue` always applies it
 * through `JSON.stringify`, which escapes any NUL byte in the source value as
 * literal text (` `), not a raw byte. So the raw NUL only ever appears at
 * position 0, placed by this function. It can't collide with real content,
 * even a quoted YAML string that itself contains an escaped NUL byte.
 */
const YAML_TYPED_VALUE_PREFIX = '\x00yaml:'

/**
 * Encode a value so it can be stored as a token attr string, then later
 * restored by `decodeYamlTypedValue`. Call this for every value read from a
 * YAML block, including strings, not only non-string values.
 *
 * @param value - The parsed YAML value to encode
 * @returns The encoded string
 */
export function encodeYamlTypedValue(value: unknown): string {
  return `${YAML_TYPED_VALUE_PREFIX}${JSON.stringify(value)}`
}

/**
 * Restore a value encoded by `encodeYamlTypedValue`.
 *
 * @param value - The string to decode
 * @returns The original value. Returns `value` unchanged if it has no encoding
 * prefix, or if the encoded content is not valid JSON.
 */
export function decodeYamlTypedValue(value: string): unknown {
  if (!value.startsWith(YAML_TYPED_VALUE_PREFIX)) {
    return value
  }
  try {
    return JSON.parse(value.slice(YAML_TYPED_VALUE_PREFIX.length))
  } catch {
    return value
  }
}

/**
 * Stringify YAML data
 * @param data - The data to stringify
 * @returns The stringified data
 */
export function stringifyYaml(data: Record<string, unknown>, options?: DumpOptions): string {
  const yamlOutput = dump(data, {
    indent: 2,
    lineWidth: -1,
    ...options,
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
    if (trimmed[0] === "'" || trimmed[0] === '"') {
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
