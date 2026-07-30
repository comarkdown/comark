'use client'

import React from 'react'
import { MarkdownClient } from './MarkdownClient.tsx'
import type { MarkdownProps } from './Markdown.tsx'
import { warnDeprecated } from '../internal/deprecation.ts'

/**
 * ComarkClient component
 *
 * @deprecated Use `MarkdownClient` instead — same component, renamed to
 * describe what it renders. `ComarkClient` will be removed in a future
 * major version.
 */
export function ComarkClient(props: MarkdownProps) {
  warnDeprecated('ComarkClient', 'MarkdownClient')
  return React.createElement(MarkdownClient, props)
}
