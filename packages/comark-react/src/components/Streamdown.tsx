'use client'

import React, { useMemo, useRef, useState } from 'react'
import type { ThemeRegistration } from 'shiki'
import highlight from 'comark/plugins/highlight'
import security from 'comark/plugins/security'
import math, { Math } from '../plugins/math.ts'
import mermaid, { Mermaid } from '../plugins/mermaid.ts'
import type { MermaidConfig } from 'comark/plugins/mermaid'
import { ComarkClient } from './ComarkClient.tsx'

export interface StreamdownControls {
  /** Show the copy / download bar on code blocks. @default true */
  code?: boolean
}

/** Built-in streaming caret shapes (Streamdown parity). */
export type CaretShape = 'block' | 'circle' | 'none'

/**
 * Map a caret shape onto Comark's `caret` prop.
 * `block` is Comark's default bar; `circle` adds a class that rounds it into a
 * dot (the class wins over the inline style for `border-radius` / size, which
 * the inline style never sets); `none` disables it.
 */
function resolveCaret(
  caret: CaretShape | boolean | { class: string } | undefined,
  streaming: boolean
): boolean | { class: string } {
  const value = caret ?? (streaming ? 'block' : 'none')
  if (value === 'none' || value === false) return false
  if (value === 'block' || value === true) return true
  if (value === 'circle') return { class: 'comark-caret-circle' }
  return value
}

export interface StreamdownProps {
  /** Markdown source. `children` (string) takes precedence over `markdown`. */
  children?: string
  markdown?: string
  /** `streaming` shows the caret and completes partial markdown; `static` for finished content. @default 'streaming' */
  mode?: 'static' | 'streaming'
  /** Complete unterminated markdown before rendering (Comark `autoClose`). @default true */
  parseIncompleteMarkdown?: boolean
  /** Extra classes on the wrapper. */
  className?: string
  /** Override / add element + component renderers (e.g. `{ h1: MyH1, alert: Alert }`). */
  components?: Record<string, React.ComponentType<any>>
  /**
   * `[light, dark]` Shiki themes. NOTE: Comark's highlighter takes theme *registration
   * objects*, not string names — import them from shiki:
   *   `import githubLight from 'shiki/themes/github-light.mjs'`
   * Omit to use Comark's bundled defaults (material-lighter / material-palenight).
   */
  shikiTheme?: [ThemeRegistration, ThemeRegistration]
  /** Toggle built-in UI controls. `true` enables all, or pass `{ code: false }`. @default true */
  controls?: boolean | StreamdownControls
  /** Mermaid theme config, mapped onto the mermaid plugin + renderer. */
  mermaid?: MermaidConfig
  /** Link allowlist (security plugin, on by default). */
  allowedLinkPrefixes?: string[]
  /** Image allowlist (security plugin, on by default). */
  allowedImagePrefixes?: string[]
  /** Origin used to resolve relative URLs during sanitization. */
  defaultOrigin?: string
  /** Streaming caret shape: `'block'` (default), `'circle'`, or `'none'`. Also accepts a raw Comark caret value. @default 'block' while streaming */
  caret?: CaretShape | boolean | { class: string }
}

/** Recursively read text out of rendered Comark nodes — used for copy / download. */
function nodeText(node: React.ReactNode): string {
  if (node == null || node === false) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (React.isValidElement(node)) return nodeText((node.props as any)?.children)
  return ''
}

const LANG_EXT: Record<string, string> = {
  javascript: 'js', typescript: 'ts', python: 'py', markdown: 'md', shell: 'sh', bash: 'sh',
}

/** Default code-block renderer with copy + download controls (Streamdown parity). */
function CodeBlock({ className, children, language, ...rest }: any) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const read = () => preRef.current?.textContent ?? nodeText(children)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(read())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const download = () => {
    const ext = LANG_EXT[language] ?? language ?? 'txt'
    const url = URL.createObjectURL(new Blob([read()], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `snippet.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="comark-codeblock" data-language={language}>
      <div className="comark-codeblock-header">
        <span className="comark-codeblock-lang">{language ?? 'text'}</span>
        <div className="comark-codeblock-actions">
          <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          <button type="button" onClick={download}>Download</button>
        </div>
      </div>
      <pre ref={preRef} className={className} {...rest}>{children}</pre>
    </div>
  )
}

/**
 * Drop-in replacement for Vercel's `<Streamdown>`, backed by Comark.
 *
 * @example
 * ```tsx
 * import { Streamdown } from '@comark/react/streamdown'
 *
 * <Streamdown>{content}</Streamdown>
 * ```
 *
 * Note: `remarkPlugins` / `rehypePlugins` are intentionally not supported —
 * Comark uses its own plugin system, not the remark/rehype pipeline.
 */
export function Streamdown({
  children,
  markdown = '',
  mode = 'streaming',
  parseIncompleteMarkdown = true,
  className,
  components,
  shikiTheme,
  controls = true,
  mermaid: mermaidConfig,
  allowedLinkPrefixes,
  allowedImagePrefixes,
  defaultOrigin,
  caret,
}: StreamdownProps) {
  const streaming = mode !== 'static'
  const codeControls = controls === true || (typeof controls === 'object' && controls.code !== false)

  // Plugins must be stable across renders (ComarkClient only re-parses on content change),
  // so memoize on the inputs that actually affect them.
  const plugins = useMemo(
    () => [
      security({ allowedLinkPrefixes, allowedImagePrefixes, defaultOrigin }),
      highlight(shikiTheme ? { themes: { light: shikiTheme[0], dark: shikiTheme[1] } } : {}),
      math(),
      mermaid(mermaidConfig),
    ],
    [allowedLinkPrefixes, allowedImagePrefixes, defaultOrigin, shikiTheme, mermaidConfig]
  )

  const mergedComponents = useMemo(
    () => ({
      math: Math,
      mermaid: Mermaid,
      ...(codeControls ? { pre: CodeBlock } : {}),
      ...components,
    }),
    [codeControls, components]
  )

  return (
    <ComarkClient
      markdown={children != null ? String(children) : markdown}
      options={{ autoClose: parseIncompleteMarkdown }}
      plugins={plugins}
      components={mergedComponents}
      streaming={streaming}
      caret={resolveCaret(caret, streaming)}
      className={['comark-streamdown', className].filter(Boolean).join(' ') || undefined}
    />
  )
}
