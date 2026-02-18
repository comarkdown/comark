import { stringifyYaml } from '../yaml'

/**
 * Convert attributes to a string of Comark attributes
 *
 * @param attributes - The attributes to stringify
 * @returns The stringified attributes
 */
export function comarkAttributes(attributes: Record<string, unknown>) {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => {
      if (key.startsWith(':') && value === 'true') {
        return key.slice(1)
      }
      if (key === 'id') {
        return `#${value}`
      }
      if (key === 'class') {
        return `.${value}`
      }

      if (typeof value === 'object') {
        return `${key}="${JSON.stringify(value).replace(/"/g, '\\"')}"`
      }

      return `${key}="${value}"`
    })

    .join(' ')

  return attrs.length > 0 ? `{${attrs}}` : ''
}

/**
 * Convert attributes to a string of HTML attributes
 *
 * @param attributes - The attributes to stringify
 * @returns The stringified attributes
 */
export function htmlAttributes(attributes: Record<string, unknown>) {
  return Object.entries(attributes)
    .map(([key, value]) => {
      if (key.startsWith(':')) {
        if (value === 'true') {
          return key.slice(1)
        }

        return `${key.slice(1)}="${value}"`
      }

      if (typeof value === 'object') {
        return `${key}="${JSON.stringify(value).replace(/"/g, '\\"')}"`
      }

      return `${key}="${value}"`
    })
    .join(' ')
}

/**
 * Convert attributes to a string of YAML attributes
 *
 * @param attributes - The attributes to stringify
 * @returns The stringified attributes
 */
export function comarkYamlAttributes(attributes: Record<string, unknown>) {
  return `---\n${stringifyYaml(attributes).trim()}\n---`
}
