/**
 * Linkify plugin for Comark.
 *
 * Converts URLs with a scheme (`https://comark.dev`) and emails into links.
 * Bare domains (`www.example.com`) need `fuzzyLink: true`. A default plugin in
 * `comark` (off with `registerDefaultPlugins: false`); register it yourself
 * with `comark/core`.
 */

import { LinkifyIt, type LinkifyOptions } from 'linkify-it'
import type { MarkdownExit } from 'markdown-exit/core'
import type { MarkdownItPlugin } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { markSourceStable } from '../internal/parse/source-stable.ts'

/**
 * linkify-it recognition options. All default to linkify-it's own defaults:
 * fuzzy links, fuzzy IPs and URL credentials off; fuzzy emails on.
 */
export type LinkifyPluginOptions = LinkifyOptions

// Parsers share a markdown-exit instance only when their markdown-it plugin functions are the
// same, so equal options must map to the same function rather than a fresh closure per call.
const markdownItPlugins = new Map<string, MarkdownItPlugin>()

function markdownItLinkify(options: LinkifyPluginOptions): MarkdownItPlugin {
  const key = JSON.stringify(options)
  let plugin = markdownItPlugins.get(key)
  if (!plugin) {
    plugin = ((md: MarkdownExit) => {
      // Imported from `linkify-it` rather than the root `markdown-exit` entry, which would register
      // a global linkifier for every parser. Fuzzy matching is opt-in: `fuzzyLink` made
      // streaming chat text about 1.8x slower (markdown-it/linkify-it#126).
      md.linkify = new LinkifyIt(options)
      md.set({ linkify: true })
    }) as unknown as MarkdownItPlugin
    markdownItPlugins.set(key, plugin)
  }
  return plugin
}

export default defineComarkPlugin((options: LinkifyPluginOptions = {}) => ({
  name: 'linkify',
  markdownItPlugins: [markSourceStable(markdownItLinkify(options))],
}))
