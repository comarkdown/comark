/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import type { ElementNode, Node } from 'comark'
import { textContent } from 'comark/utils'
import { resolveSyntaxStyle, useMarkdownTheme } from '../theme.ts'
import { isElementNode, withNode } from '../utils.ts'

/**
 * Fence info string, from either the `pre`'s own `language` attribute or the
 * `language-*` class Comark puts on the inner `code` node.
 */
export function fenceLanguage(node: ElementNode | undefined): string | undefined {
  if (!node) {
    return undefined
  }

  const declared = node[1]?.language

  if (typeof declared === 'string' && declared.length > 0) {
    return declared
  }

  const code = node[2]

  if (!Array.isArray(code)) {
    return undefined
  }

  const className = code[1]?.class

  if (typeof className !== 'string') {
    return undefined
  }

  return className
    .split(' ')
    .find((entry) => entry.startsWith('language-'))
    ?.slice('language-'.length)
}

interface Token {
  text: string
  fg?: string
}

/**
 * Colour out of a Shiki inline style.
 *
 * Shiki emits `color:` for its light theme and `--shiki-dark:` for its dark one.
 * Terminals are dark far more often than not, so the dark variant wins when both
 * are present.
 */
function tokenColor(style: unknown): string | undefined {
  if (typeof style !== 'string') {
    return undefined
  }

  const dark = /--shiki-dark:\s*(#[0-9a-fA-F]{3,8})/.exec(style)

  if (dark) {
    return dark[1]
  }

  return /(?:^|;)\s*color:\s*(#[0-9a-fA-F]{3,8})/.exec(style)?.[1]
}

/** Flatten one Shiki line span into its coloured leaves. */
function lineTokens(node: ElementNode, inherited?: string, into: Token[] = []): Token[] {
  const fg = tokenColor(node[1]?.style) ?? inherited

  for (const child of node.slice(2) as Node[]) {
    if (typeof child === 'string') {
      into.push({ text: child.replace(/\n/g, ''), fg })
      continue
    }

    if (isElementNode(child)) {
      lineTokens(child, fg, into)
    }
  }

  return into
}

/**
 * Per-line tokens when the Shiki plugin has highlighted this fence, else null.
 *
 * Shiki rewrites the `code` node into one `span.line` per line, each holding
 * coloured token spans. Reusing them means code is highlighted with the theme the
 * host chose, for every language Shiki knows, with no grammar to install.
 */
export function shikiTokens(node: ElementNode | undefined): Token[][] | null {
  const code = node?.[2]

  if (!Array.isArray(code)) {
    return null
  }

  const lines: Token[][] = []

  for (const child of code.slice(2) as Node[]) {
    if (isElementNode(child) && child[0] === 'span') {
      lines.push(lineTokens(child))
    }
  }

  return lines.length > 0 ? lines : null
}

/**
 * Fenced code block.
 *
 * Two highlighting paths, because they need very different things from the host:
 *
 *   - Shiki tokens, when the plugin is registered. Colours come from the AST, so
 *     nothing has to be installed and every Shiki language works.
 *   - otherwise OpenTUI's `CodeRenderable`, which highlights with tree-sitter.
 *     That is the faster, incremental path, but it only produces colour for
 *     languages whose grammar the host registered via `addDefaultParsers` —
 *     OpenTUI ships none — and it needs a populated `theme.syntaxStyle`.
 *
 * The body is read off the source node rather than from `children` so either
 * shape flattens back to the original source.
 */
export const CodeBlock = withNode<{ __node?: ElementNode }>(({ __node }) => {
  const theme = useMarkdownTheme()
  const language = fenceLanguage(__node)
  const filename = typeof __node?.[1]?.filename === 'string' ? __node[1].filename : undefined
  const tokens = shikiTokens(__node)

  const header =
    language || filename ? (
      <text>
        {language ? (
          <span
            fg={theme.codeFg}
            attributes={TextAttributes.BOLD}
          >
            {language}
          </span>
        ) : null}
        {filename ? <span fg={theme.muted}>{language ? `  ${filename}` : filename}</span> : null}
      </text>
    ) : null

  if (tokens) {
    return (
      <box flexDirection="column">
        {header}
        {tokens.map((line, index) => (
          <text key={index}>
            {line.map((token, position) => (
              <span
                key={position}
                fg={token.fg}
              >
                {token.text}
              </span>
            ))}
          </text>
        ))}
      </box>
    )
  }

  return (
    <box flexDirection="column">
      {header}
      <code
        content={__node ? textContent(__node).replace(/\n+$/, '') : ''}
        filetype={language}
        syntaxStyle={resolveSyntaxStyle(theme)}
      />
    </box>
  )
})
