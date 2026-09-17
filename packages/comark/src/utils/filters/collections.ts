import type { BindingFilters } from './types.ts'

const toArr = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v
  if (v != null && typeof v === 'object') return Object.values(v as Record<string, unknown>)
  return v != null ? [v] : []
}

const getPath = (obj: unknown, path: string): unknown => {
  if (!path) return obj
  const keys = path.split('.')
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return cur
}

const applyTemplate = (obj: unknown, tpl: string): string => {
  const out: string[] = []
  let i = 0
  while (i < tpl.length) {
    if (tpl[i] === '$' && i + 1 < tpl.length && tpl[i + 1] === '{') {
      let j = i + 2
      while (j < tpl.length && tpl[j] !== '}') j++
      const key = tpl.slice(i + 2, j).trim()
      const val = getPath(obj, key)
      out.push(val != null ? String(val) : '')
      i = j + 1
    } else {
      out.push(tpl[i])
      i++
    }
  }
  return out.join('')
}

// Parse CSS-like nth-child pattern (1-indexed)
const makeNthMatcher = (pattern: string): ((oneIdx: number) => boolean) => {
  const p = pattern.trim().toLowerCase()
  if (p === 'even') return (i) => i % 2 === 0
  if (p === 'odd') return (i) => i % 2 !== 0
  if (p === 'n' || p === '1n') return () => true
  // Integer only: "3" means position 3
  const numOnly = parseInt(p, 10)
  if (!isNaN(numOnly) && String(numOnly) === p) return (i) => i === numOnly
  // An+B or An-B
  const nIdx = p.indexOf('n')
  if (nIdx === -1) return () => false
  const aStr = p.slice(0, nIdx).trim()
  const a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseInt(aStr, 10) || 0
  const rest = p.slice(nIdx + 1).trim()
  const b = rest ? parseInt(rest, 10) || 0 : 0
  return (i) => {
    if (a === 0) return i === b
    const n = (i - b) / a
    return n >= 0 && Number.isInteger(n)
  }
}

export const collectionsFilters: BindingFilters = {
  compact: (v) => {
    if (Array.isArray(v)) return v.filter((item) => item != null && item !== '')
    if (v != null && typeof v === 'object') {
      const result: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (val != null && val !== '') result[k] = val
      }
      return result
    }
    return v
  },
  first: (v, count) => {
    const arr = toArr(v)
    if (count == null) return arr[0]
    const n = typeof count === 'number' ? count : Number(count)
    return arr.slice(0, Number.isFinite(n) ? n : 1)
  },
  join: (v, sep = ', ') => {
    const arr = toArr(v)
    return arr.map((item) => (item == null ? '' : String(item))).join(String(sep))
  },
  last: (v, count) => {
    const arr = toArr(v)
    if (count == null) return arr[arr.length - 1]
    const n = typeof count === 'number' ? count : Number(count)
    return arr.slice(Number.isFinite(n) ? -n : -1)
  },
  length: (v) => {
    if (typeof v === 'string') return v.length
    if (Array.isArray(v)) return v.length
    if (v != null && typeof v === 'object') return Object.keys(v as object).length
    return 0
  },
  map: (v, prop) => {
    if (prop == null) return v
    const tpl = String(prop)
    const isTemplate = tpl.includes('${')
    const arr = toArr(v)
    return arr.map((item) => (isTemplate ? applyTemplate(item, tpl) : getPath(item, tpl)))
  },
  merge: (v, ...extras) => {
    const arr = toArr(v)
    return [...arr, ...extras.flatMap((e) => toArr(e))]
  },
  nth: (v, pattern) => {
    const arr = toArr(v)
    if (pattern == null) return arr
    const matches = makeNthMatcher(String(pattern))
    return arr.filter((_, i) => matches(i + 1))
  },
  object: (v, mode) => {
    if (v == null || typeof v !== 'object' || Array.isArray(v)) return v
    const obj = v as Record<string, unknown>
    const m = mode != null ? String(mode) : 'entries'
    if (m === 'keys') return Object.keys(obj)
    if (m === 'values') return Object.values(obj)
    return Object.entries(obj).map(([k, val]) => ({ key: k, value: val }))
  },
  parse_json: (v) => {
    if (typeof v !== 'string') return v
    try {
      return JSON.parse(v)
    } catch {
      return v
    }
  },
  reverse: (v) => {
    if (typeof v === 'string') return v.split('').reverse().join('')
    if (Array.isArray(v)) return [...v].reverse()
    if (v != null && typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>).reverse()
      return Object.fromEntries(entries)
    }
    return v
  },
  slice: (v, start, end) => {
    const s = typeof start === 'number' ? start : Number(start ?? 0)
    const e = end != null ? (typeof end === 'number' ? end : Number(end)) : undefined
    if (typeof v === 'string') return e !== undefined ? v.slice(s, e) : v.slice(s)
    const arr = toArr(v)
    return e !== undefined ? arr.slice(s, e) : arr.slice(s)
  },
  sort: (v, prop) => {
    const arr = toArr(v)
    const p = prop != null ? String(prop) : ''
    let key = p
    let desc = false
    if (p.endsWith(':desc')) {
      key = p.slice(0, -5)
      desc = true
    } else if (p.endsWith(':asc')) {
      key = p.slice(0, -4)
    }
    const cmp = (a: unknown, b: unknown): number => {
      const aVal = key ? getPath(a, key) : a
      const bVal = key ? getPath(b, key) : b
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal
      return String(aVal).localeCompare(String(bVal))
    }
    const sorted = [...arr].sort(cmp)
    return desc ? sorted.reverse() : sorted
  },
  split: (v, sep = ',') => {
    const s = typeof v === 'string' ? v : String(v ?? '')
    return s.split(String(sep))
  },
  sum: (v, prop) => {
    const arr = toArr(v)
    return arr.reduce((acc: number, item) => {
      const val = prop != null ? getPath(item, String(prop)) : item
      const n = typeof val === 'number' ? val : Number(val)
      return acc + (Number.isFinite(n) ? n : 0)
    }, 0)
  },
  template: (v, tpl) => {
    if (tpl == null) return String(v ?? '')
    const t = String(tpl)
    if (Array.isArray(v)) return v.map((item) => applyTemplate(item, t)).join('\n')
    return applyTemplate(v, t)
  },
  unique: (v) => {
    if (typeof v === 'string') {
      const seen = new Set<string>()
      let out = ''
      for (const c of v) {
        if (!seen.has(c)) {
          seen.add(c)
          out += c
        }
      }
      return out
    }
    const arr = toArr(v)
    const seen = new Set()
    return arr.filter((item) => {
      const key = typeof item === 'object' ? JSON.stringify(item) : item
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  },
  where: (v, prop, value) => {
    const arr = toArr(v)
    if (prop == null) return arr
    const key = String(prop)
    if (value === undefined)
      return arr.filter((item) => {
        const val = getPath(item, key)
        return val != null && val !== false && val !== ''
      })
    return arr.filter((item) => getPath(item, key) === value)
  },
}
