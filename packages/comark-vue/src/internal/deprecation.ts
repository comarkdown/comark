const warned = new Set<string>()

/**
 * Logs a one-time deprecation warning in development.
 * No-op in production builds.
 */
export function warnDeprecated(oldName: string, newName: string): void {
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV
  if (nodeEnv === 'production') return
  if (warned.has(oldName)) return
  warned.add(oldName)
  console.warn(`[@comark/vue] \`${oldName}\` is deprecated. Use \`${newName}\` instead.`)
}
