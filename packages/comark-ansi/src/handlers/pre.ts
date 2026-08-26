import type { NodeHandler } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { textContent } from 'comark/utils'
import { DIM, CYAN, RESET, BOLD } from '../utils/escape.ts'

// --- True-color helpers ---
const int16 = (c: string) => Number.parseInt(c, 16)

function hexToAnsi(hex: string): string {
  if (hex[0] !== '#') return ''

  let r: number, g: number, b: number

  if (hex.length === 4) {
    r = int16(hex[1] + hex[1])
    g = int16(hex[2] + hex[2])
    b = int16(hex[3] + hex[3])
  } else if (hex.length === 7) {
    r = int16(hex.slice(1, 3))
    g = int16(hex.slice(3, 5))
    b = int16(hex.slice(5, 7))
  } else {
    return ''
  }

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return ''

  return `\x1B[38;2;${r};${g};${b}m`
}
/** Prefer --shiki-dark for terminal dark backgrounds, fall back to color. */
function extractColor(style: string): string | null {
  const dark = style.match(/--shiki-dark:\s*(#[0-9a-f]{3,6})/i)
  if (dark) return dark[1]
  const light = style.match(/color:\s*(#[0-9a-f]{3,6})/i)
  if (light) return light[1]
  return null
}

// --- Highlighted code rendering ---

function renderToken(token: Node, colors: boolean): string {
  if (typeof token === 'string') return token
  if (token[0] !== 'span') return typeof token[2] === 'string' ? token[2] : ''

  const content = (token.slice(2) as Node[]).map((t) => (typeof t === 'string' ? t : '')).join('')

  if (!colors) return content

  const style = String(token[1].style || '')
  const color = style ? extractColor(style) : null
  return color ? hexToAnsi(color) + content + RESET : content
}

function renderHighlighted(codeNode: ElementNode, colors: boolean): string {
  const children = codeNode.slice(2) as Node[]
  return children
    .map((child) => {
      if (typeof child === 'string') return child // newline separator
      if (child[0] !== 'span') return ''
      if ((child[1]?.class as string)?.includes('line')) {
        // span.line — render its token children
        return (child.slice(2) as Node[]).map((t) => renderToken(t, colors)).join('')
      }
      return renderToken(child, colors)
    })
    .join('')
}

// --- Handler ---

export const pre: NodeHandler = (node, state) => {
  const attrs = node[1]
  const codeClasses = (node[2]?.[1] as Record<string, string> | undefined)?.class
  const language = String(
    attrs.language ||
      codeClasses
        ?.split(' ')
        .find((c: string) => c.startsWith('language-'))
        ?.slice(9) ||
      ''
  )
  const filename = attrs.filename ? String(attrs.filename) : ''
  const { colors } = state.context

  // Header: "typescript  main.ts" or just "typescript"
  const langPart = language ? BOLD + CYAN + language + RESET : ''
  const filePart = filename ? DIM + '  ' + filename + RESET : ''
  const header = langPart || filePart ? langPart + filePart + '\n' : ''

  // Check if already highlighted by the highlight plugin (code has span.line children)
  const codeNode = node[2] as ElementNode | undefined
  const isHighlighted =
    codeNode?.[0] === 'code' &&
    (codeNode.slice(2) as Node[]).some((c) => !isString(c) && (c as ElementNode)[0] === 'span')

  const code = isHighlighted ? renderHighlighted(codeNode!, Boolean(colors)) : textContent(node).trim()

  return '```' + (header || '\n') + code + '\n```\n\n'
}

function isString(v: unknown): v is string {
  return typeof v === 'string'
}
