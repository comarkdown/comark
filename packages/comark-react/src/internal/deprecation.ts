const warned = new Set<string>()

/**
 * Logs a one-time deprecation warning in development.
 * No-op in production builds.
 */
export function warnDeprecated(oldName: string, newName: string): void {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  if (warned.has(oldName)) return
  warned.add(oldName)
  console.warn(`[@comark/react] \`${oldName}\` is deprecated. Use \`${newName}\` instead.`)
}
