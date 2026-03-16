export const RESET = '\x1B[0m'
export const BOLD = '\x1B[1m'
export const DIM = '\x1B[2m'
export const ITALIC = '\x1B[3m'
export const UNDERLINE = '\x1B[4m'
export const STRIKETHROUGH = '\x1B[9m'
export const CYAN = '\x1B[36m'
export const YELLOW = '\x1B[33m'
export const GREEN = '\x1B[32m'
export const BLUE = '\x1B[34m'
export const MAGENTA = '\x1B[35m'
export const RED = '\x1B[31m'

export function wrap(open: string, text: string, colors: boolean): string {
  if (!colors || !text) return text
  return open + text + RESET
}
