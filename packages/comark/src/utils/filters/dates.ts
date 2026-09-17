import type { BindingFilters } from './types.ts'

const pad = (n: number, len = 2) => String(n).padStart(len, '0')

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3))
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = DAY_NAMES.map((d) => d.slice(0, 3))

const toDate = (v: unknown): Date | null => {
  if (v instanceof Date) return v
  if (typeof v === 'number') {
    // Distinguish Unix seconds (<= 1e10) from milliseconds
    const d = new Date(v > 1e10 ? v : v * 1000)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof v === 'string' && v) {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

const formatDate = (d: Date, fmt: string): string => {
  const tokens: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    YY: String(d.getFullYear()).slice(-2),
    MMMM: MONTH_NAMES[d.getMonth()],
    MMM: MONTH_SHORT[d.getMonth()],
    MM: pad(d.getMonth() + 1),
    M: String(d.getMonth() + 1),
    DDDD: DAY_NAMES[d.getDay()],
    DDD: DAY_SHORT[d.getDay()],
    DD: pad(d.getDate()),
    D: String(d.getDate()),
    HH: pad(d.getHours()),
    H: String(d.getHours()),
    hh: pad(d.getHours() % 12 || 12),
    h: String(d.getHours() % 12 || 12),
    mm: pad(d.getMinutes()),
    m: String(d.getMinutes()),
    ss: pad(d.getSeconds()),
    s: String(d.getSeconds()),
    A: d.getHours() < 12 ? 'AM' : 'PM',
    a: d.getHours() < 12 ? 'am' : 'pm',
  }
  // Replace longest tokens first to avoid partial matches
  const tokenOrder = Object.keys(tokens).sort((a, b) => b.length - a.length)
  let result = ''
  let i = 0
  while (i < fmt.length) {
    let matched = false
    for (const tok of tokenOrder) {
      if (fmt.startsWith(tok, i)) {
        result += tokens[tok]
        i += tok.length
        matched = true
        break
      }
    }
    if (!matched) {
      result += fmt[i]
      i++
    }
  }
  return result
}

// Parse interval strings like "+1 day", "-2 weeks", "+3 months"
const UNIT_MAP: Record<string, string> = {
  year: 'year',
  years: 'year',
  y: 'year',
  month: 'month',
  months: 'month',
  week: 'week',
  weeks: 'week',
  w: 'week',
  day: 'day',
  days: 'day',
  d: 'day',
  hour: 'hour',
  hours: 'hour',
  h: 'hour',
  minute: 'minute',
  minutes: 'minute',
  min: 'minute',
  mins: 'minute',
  m: 'minute',
  second: 'second',
  seconds: 'second',
  sec: 'second',
  secs: 'second',
  s: 'second',
}

const parseInterval = (interval: string): { sign: number; amount: number; unit: string } | null => {
  const s = interval.trim()
  let sign = 1
  let rest = s
  if (rest[0] === '+') {
    rest = rest.slice(1).trim()
  } else if (rest[0] === '-') {
    sign = -1
    rest = rest.slice(1).trim()
  }
  const spaceIdx = rest.indexOf(' ')
  if (spaceIdx === -1) return null
  const amount = parseFloat(rest.slice(0, spaceIdx))
  const unitRaw = rest
    .slice(spaceIdx + 1)
    .trim()
    .toLowerCase()
  const unit = UNIT_MAP[unitRaw]
  if (!unit || isNaN(amount)) return null
  return { sign, amount, unit }
}

const applyInterval = (d: Date, interval: string): Date => {
  const parsed = parseInterval(interval)
  if (!parsed) return d
  const { sign, amount, unit } = parsed
  const delta = sign * amount
  const out = new Date(d.getTime())
  if (unit === 'second') out.setSeconds(out.getSeconds() + delta)
  else if (unit === 'minute') out.setMinutes(out.getMinutes() + delta)
  else if (unit === 'hour') out.setHours(out.getHours() + delta)
  else if (unit === 'day') out.setDate(out.getDate() + delta)
  else if (unit === 'week') out.setDate(out.getDate() + delta * 7)
  else if (unit === 'month') out.setMonth(out.getMonth() + delta)
  else if (unit === 'year') out.setFullYear(out.getFullYear() + delta)
  return out
}

const parseDuration = (v: unknown): number => {
  if (typeof v === 'number') return v
  const s = String(v ?? '').trim()
  if (!s) return 0
  // ISO 8601 duration: P1Y2M3DT4H5M6S or PT1H30M
  if (s[0] === 'P' || s[0] === 'p') {
    const upper = s.toUpperCase()
    const getValue = (char: string): number => {
      const idx = upper.indexOf(char)
      if (idx === -1) return 0
      let start = idx - 1
      while (
        start > 0 &&
        (upper[start - 1] === '.' || (upper.charCodeAt(start - 1) >= 48 && upper.charCodeAt(start - 1) <= 57))
      )
        start--
      return parseFloat(upper.slice(start, idx)) || 0
    }
    const years = getValue('Y')
    const tIdx = upper.indexOf('T')
    const beforeT = upper.slice(0, tIdx === -1 ? upper.length : tIdx)
    const months = beforeT.includes('M') ? getValue('M') : 0
    const days = getValue('D')
    const afterT = tIdx === -1 ? '' : upper.slice(tIdx)
    const hours = afterT.includes('H') ? getValue('H') : 0
    const mins = afterT.includes('M')
      ? parseFloat(afterT.slice(afterT.lastIndexOf('M') - 4, afterT.lastIndexOf('M')).replace(/[^0-9.]/g, '')) || 0
      : 0
    const secs = afterT.includes('S') ? getValue('S') : 0
    return years * 31536000 + months * 2592000 + days * 86400 + hours * 3600 + mins * 60 + secs
  }
  return parseFloat(s) || 0
}

const formatDuration = (totalSec: number): string => {
  const abs = Math.abs(Math.round(totalSec))
  const sign = totalSec < 0 ? '-' : ''
  if (abs === 0) return '0s'
  const years = Math.floor(abs / 31536000)
  const months = Math.floor((abs % 31536000) / 2592000)
  const days = Math.floor((abs % 2592000) / 86400)
  const hours = Math.floor((abs % 86400) / 3600)
  const minutes = Math.floor((abs % 3600) / 60)
  const seconds = abs % 60
  const parts: string[] = []
  if (years) parts.push(`${years}y`)
  if (months) parts.push(`${months}mo`)
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (seconds) parts.push(`${seconds}s`)
  return sign + parts.join(' ')
}

export const datesFilters: BindingFilters = {
  date: (v, fmt) => {
    const d = toDate(v)
    if (!d) return ''
    const format = fmt != null ? String(fmt) : 'YYYY-MM-DD'
    return formatDate(d, format)
  },
  date_modify: (v, interval) => {
    const d = toDate(v)
    if (!d) return v
    if (interval == null) return v
    return applyInterval(d, String(interval))
  },
  duration: (v) => {
    const secs = parseDuration(v)
    return formatDuration(secs)
  },
}
