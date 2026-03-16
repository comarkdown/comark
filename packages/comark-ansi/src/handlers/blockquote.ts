import type { NodeHandler } from 'comark/string'
import type { ComarkNode } from 'comark/ast'
import { BOLD, DIM, RESET, BLUE, GREEN, MAGENTA, YELLOW, RED } from '../escape.ts'

type AlertType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION'

const ALERTS: Record<AlertType, { color: string, icon: string }> = {
  NOTE: { color: BLUE, icon: 'ℹ' },
  TIP: { color: GREEN, icon: '◆' },
  IMPORTANT: { color: MAGENTA, icon: '‼' },
  WARNING: { color: YELLOW, icon: '⚠' },
  CAUTION: { color: RED, icon: '✖' },
}

export const blockquote: NodeHandler = (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  const { colors } = state.context

  const as = node[1].as ? String(node[1].as).toUpperCase() as AlertType : null
  const alert = as ? ALERTS[as] : null

  const revert = state.applyContext({ blockquoteDepth: Number(state.context.blockquoteDepth ?? 0) + 1 })

  const content = children.map(child => state.one(child, state, node))
    .join('')
    .trimEnd()

  state.applyContext(revert)

  if (alert) {
    const { color, icon } = alert
    const label = as!
    const bar = colors ? color + '│' + RESET : '│'
    const header = colors
      ? color + BOLD + `${icon}  ${label}` + RESET
      : `${icon}  ${label}`
    const lines = content.split('\n').map(line => `${bar} ${line}`)
    return header + '\n' + lines.join('\n') + '\n\n'
  }

  const prefix = colors ? DIM + '│ ' + RESET : '│ '
  const lines = content.split('\n').map(line => prefix + line)
  return lines.join('\n') + '\n\n'
}
