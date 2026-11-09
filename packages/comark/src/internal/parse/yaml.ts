import { JSON_SCHEMA, loadAll, YAMLException } from 'js-yaml'

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
