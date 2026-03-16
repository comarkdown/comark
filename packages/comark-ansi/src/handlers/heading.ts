import { BOLD, UNDERLINE, RESET, YELLOW, MAGENTA, CYAN, GREEN, DIM } from '../escape.ts'
import type { NodeHandler } from 'comark/string'

const LEVEL_STYLES = [BOLD + UNDERLINE, BOLD + YELLOW, BOLD + CYAN, BOLD + GREEN, BOLD + MAGENTA, BOLD + DIM]

export const heading: NodeHandler = (node, state) => {
  const level = Number((node[0] as string).slice(1))
  const content = state.flow(node, state)
  const prefix = '#'.repeat(level) + ' '

  if (!state.context.colors) {
    return prefix + content + '\n\n'
  }

  const style = LEVEL_STYLES[level - 1] ?? BOLD
  return style + prefix + content + RESET + '\n\n'
}
