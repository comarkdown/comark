'use client'

import React from 'react'
import { MarkdownLive } from './MarkdownLive.tsx'
import type { MarkdownLiveProps } from './MarkdownLive.tsx'
import { warnDeprecated } from '../internal/deprecation.ts'

/**
 * Props for the ComarkLive component
 * @deprecated Use `MarkdownLiveProps` instead
 */
export type ComarkLiveProps = MarkdownLiveProps

/**
 * ComarkLive component
 *
 * @deprecated Use `MarkdownLive` instead — same component, renamed to
 * describe what it renders. `ComarkLive` will be removed in a future
 * major version.
 */
export function ComarkLive(props: ComarkLiveProps) {
  warnDeprecated('ComarkLive', 'MarkdownLive')
  return React.createElement(MarkdownLive, props)
}
