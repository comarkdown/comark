export type BindingFilter = (value: unknown, ...args: unknown[]) => unknown
export type BindingFilters = Record<string, BindingFilter>

export interface FilterSpec {
  name: string
  args: unknown[]
}

export interface ParsedBinding {
  path: string
  filters: FilterSpec[]
}

/**
 * Parse a binding expression into a base dot-path and an ordered list of
 * filter specs.
 *
 * Examples:
 *   `"title | upper"`              → { path: "title",  filters: [{ name: "upper", args: [] }] }
 *   `"title | truncate:10 | upper"` → { path: "title", filters: [{ name: "truncate", args: [10] }, { name: "upper", args: [] }] }
 *   `"user.name"`                  → { path: "user.name", filters: [] }
 *
 * `||` pairs are never treated as a pipe split (the binding parser already
 * strips the `||` default before storing `:value`, but we guard here too).
 *
 * Colon-delimited filter args respect quoted strings, so
 * `date:'YYYY-MM-DD HH:mm'` parses as name="date", args=["YYYY-MM-DD HH:mm"].
 */
export function parseBindingExpression(expr: string): ParsedBinding {
  if (!expr.includes('|')) return { path: expr.trim(), filters: [] }

  const segments = splitOnPipe(expr)
  if (segments.length <= 1) return { path: expr.trim(), filters: [] }

  const path = segments[0].trim()
  const filters: FilterSpec[] = []
  for (let s = 1; s < segments.length; s++) {
    const seg = segments[s].trim()
    if (!seg) continue
    filters.push(parseFilterSegment(seg))
  }

  return { path, filters }
}

/**
 * Apply a sequence of filter specs against a value, using the provided
 * filter registry.
 *
 * Throws when a named filter is not found in the registry.
 */
export function applyBindingFilters(value: unknown, filters: FilterSpec[], registry: BindingFilters): unknown {
  let result = value
  for (const { name, args } of filters) {
    const fn = registry[name]
    if (!fn) throw new Error(`Unknown binding filter: "${name}"`)
    result = fn(result, ...args)
  }
  return result
}

// Split on single `|` outside of quoted strings; skip `||` pairs.
function splitOnPipe(expr: string): string[] {
  const segments: string[] = []
  let segment = ''
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (ch === '"' || ch === "'") {
      const close = ch
      segment += ch
      i++
      while (i < expr.length && expr[i] !== close) {
        segment += expr[i]
        i++
      }
      if (i < expr.length) {
        segment += expr[i]
        i++
      }
      continue
    }
    if (ch === '|') {
      if (i + 1 < expr.length && expr[i + 1] === '|') {
        segment += '||'
        i += 2
        continue
      }
      segments.push(segment)
      segment = ''
      i++
      continue
    }
    segment += ch
    i++
  }
  segments.push(segment)
  return segments
}

// Parse a single filter segment, e.g. `"truncate:10"` or `"date:'YYYY-MM-DD'"`.
function parseFilterSegment(seg: string): FilterSpec {
  const parts = splitOnColon(seg)
  const name = parts[0].trim()
  const args: unknown[] = []
  for (let p = 1; p < parts.length; p++) {
    args.push(parseArgLiteral(parts[p].trim()))
  }
  return { name, args }
}

// Split on `:` outside of quoted strings.
function splitOnColon(seg: string): string[] {
  const parts: string[] = []
  let part = ''
  let i = 0
  while (i < seg.length) {
    const ch = seg[i]
    if (ch === '"' || ch === "'") {
      const close = ch
      part += ch
      i++
      while (i < seg.length && seg[i] !== close) {
        part += seg[i]
        i++
      }
      if (i < seg.length) {
        part += seg[i]
        i++
      }
      continue
    }
    if (ch === ':') {
      parts.push(part)
      part = ''
      i++
      continue
    }
    part += ch
    i++
  }
  parts.push(part)
  return parts
}

// Parse a filter argument literal from a string token.
function parseArgLiteral(arg: string): unknown {
  if (!arg) return arg
  const first = arg[0]
  const last = arg[arg.length - 1]
  if ((first === "'" && last === "'") || (first === '"' && last === '"')) {
    return arg.slice(1, -1)
  }
  try {
    return JSON.parse(arg)
  } catch {
    return arg
  }
}
