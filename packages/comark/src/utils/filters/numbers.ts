import type { BindingFilters } from './types.ts'

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const numbersFilters: BindingFilters = {
  calc: (v, op, operand) => {
    const n = toNum(v)
    const o = toNum(operand)
    const operator = String(op ?? '+').trim()
    if (operator === '+') return n + o
    if (operator === '-') return n - o
    if (operator === '*') return n * o
    if (operator === '/') return o !== 0 ? n / o : NaN
    if (operator === '%') return o !== 0 ? n % o : NaN
    if (operator === '^' || operator === '**') return n ** o
    return n
  },
  number_format: (v, decimals, decimalSep, thousandSep) => {
    const n = toNum(v)
    const d = typeof decimals === 'number' ? decimals : Number(decimals ?? 0)
    const places = Number.isFinite(d) && d >= 0 ? d : 0
    const dSep = decimalSep != null ? String(decimalSep) : '.'
    const tSep = thousandSep != null ? String(thousandSep) : ','
    const fixed = Math.abs(n).toFixed(places)
    const [intPart, fracPart] = fixed.split('.')
    let formatted = ''
    const len = intPart.length
    for (let i = 0; i < len; i++) {
      if (i > 0 && (len - i) % 3 === 0) formatted += tSep
      formatted += intPart[i]
    }
    if (fracPart !== undefined) formatted += dSep + fracPart
    return (n < 0 ? '-' : '') + formatted
  },
  round: (v, places) => {
    const n = toNum(v)
    const p = typeof places === 'number' ? places : Number(places ?? 0)
    const exp = Number.isFinite(p) && p >= 0 ? p : 0
    if (exp === 0) return Math.round(n)
    const factor = 10 ** exp
    return Math.round(n * factor) / factor
  },
}
