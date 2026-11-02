import { parse, stringify, type StringifyOptions } from 'tinyaml'

/**
 * Parse YAML content.
 *
 * @param content - The content to parse
 * @returns The parsed data, or `undefined` when the content has no YAML document
 */
export function parseYaml(content: string): Record<string, unknown> | undefined {
  return parse(content) as Record<string, unknown> | undefined
}

/**
 * Stringify YAML data
 * @param data - The data to stringify
 * @returns The stringified data
 */
export function stringifyYaml(data: Record<string, unknown>, options?: StringifyOptions): string {
  return stringify(data, options)
}
