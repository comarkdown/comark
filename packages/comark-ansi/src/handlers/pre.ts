import type { NodeHandler } from 'comark/string'
import type { ComarkElement, ComarkNode } from 'comark/ast'
import { textContent } from 'comark/ast'
import { DIM, CYAN, RESET, BOLD } from '../escape.ts'

// --- True-color helpers ---

function hexToAnsi(hex: string): string {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return ''
  return `\x1B[38;2;${Number.parseInt(m[1], 16)};${Number.parseInt(m[2], 16)};${Number.parseInt(m[3], 16)}m`
}

/** Prefer --shiki-dark for terminal dark backgrounds, fall back to color. */
function extractColor(style: string): string | null {
  const dark = style.match(/--shiki-dark:\s*(#[0-9a-f]{6})/i)
  if (dark) return dark[1]
  const light = style.match(/color:\s*(#[0-9a-f]{6})/i)
  if (light) return light[1]
  return null
}

// --- Highlighted code rendering ---

function renderToken(token: ComarkNode, colors: boolean): string {
  if (typeof token === 'string') return token
  if (token[0] !== 'span') return typeof token[2] === 'string' ? token[2] : ''

  const content = (token.slice(2) as ComarkNode[])
    .map(t => (typeof t === 'string' ? t : ''))
    .join('')

  if (!colors) return content

  const style = String(token[1].style || '')
  const color = style ? extractColor(style) : null
  return color ? hexToAnsi(color) + content + RESET : content
}

function renderHighlighted(codeNode: ComarkElement, colors: boolean): string {
  const children = codeNode.slice(2) as ComarkNode[]
  return children.map((child) => {
    if (typeof child === 'string') return child // newline separator
    if (child[0] !== 'span') return ''
    // span.line — render its token children
    return (child.slice(2) as ComarkNode[]).map(t => renderToken(t, colors)).join('')
  }).join('')
}

// --- Handler ---

export const pre: NodeHandler = (node, state) => {
  const attrs = node[1]
  const codeClasses = (node[2]?.[1] as Record<string, string> | undefined)?.class
  const language = String(
    attrs.language
    || codeClasses?.split(' ').find((c: string) => c.startsWith('language-'))?.slice(9)
    || '',
  )
  const filename = attrs.filename ? String(attrs.filename) : ''
  const { colors } = state.context

  // Header: "typescript  main.ts" or just "typescript"
  const langPart = language ? BOLD + CYAN + language + RESET : ''
  const filePart = filename ? DIM + '  ' + filename + RESET : ''
  const header = (langPart || filePart) ? (langPart + filePart + '\n') : ''

  // Check if already highlighted by the highlight plugin (code has span.line children)
  const codeNode = node[2] as ComarkElement | undefined
  const isHighlighted = codeNode?.[0] === 'code'
    && (codeNode.slice(2) as ComarkNode[]).some(c => !isString(c) && (c as ComarkElement)[0] === 'span')

  const code = isHighlighted
    ? renderHighlighted(codeNode!, Boolean(colors))
    : textContent(node).trim()

  return '```' + (header || '\n') + code + '\n```\n\n'
}

function isString(v: unknown): v is string {
  return typeof v === 'string'
}
