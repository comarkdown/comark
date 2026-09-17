import { Parser } from 'htmlparser2'
import type { BindingFilters } from './types.ts'

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/**
 * Rebuild an HTML string with per-tag transformation applied.
 * Passes element open/close events through the provided callbacks.
 */
const rebuildHtml = (
  html: string,
  opts: {
    openTag?: (
      tag: string,
      attribs: Record<string, string>
    ) => { tag?: string; attribs?: Record<string, string>; drop?: boolean } | null
    closeTag?: (tag: string) => string | null
    keepContent?: (tag: string) => boolean
  }
): string => {
  const chunks: string[] = []
  // Tags where both content AND close are suppressed
  const skipStack: string[] = []
  // Tags where the open and close are suppressed but content is kept
  const dropCloseStack: string[] = []

  const attribStr = (attribs: Record<string, string>) =>
    Object.entries(attribs)
      .map(([k, v]) => (v === '' ? k : `${k}="${v}"`))
      .join(' ')

  const parser = new Parser(
    {
      onopentag(rawTag, rawAttribs) {
        if (skipStack.length > 0 && !VOID_TAGS.has(rawTag)) {
          if (opts.keepContent?.(rawTag) === false) skipStack.push(rawTag)
          return
        }
        const result = opts.openTag ? opts.openTag(rawTag, rawAttribs) : null
        if (result?.drop) {
          if (!VOID_TAGS.has(rawTag)) {
            if (opts.keepContent?.(rawTag) === false) {
              skipStack.push(rawTag)
            } else {
              dropCloseStack.push(rawTag)
            }
          }
          return
        }
        const outTag = result?.tag ?? rawTag
        const outAttribs = result?.attribs ?? rawAttribs
        const attrs = attribStr(outAttribs)
        chunks.push(attrs ? `<${outTag} ${attrs}>` : `<${outTag}>`)
      },
      onclosetag(rawTag, isImplied) {
        if (skipStack.length > 0) {
          if (skipStack[skipStack.length - 1] === rawTag) skipStack.pop()
          return
        }
        if (dropCloseStack.length > 0 && dropCloseStack[dropCloseStack.length - 1] === rawTag) {
          dropCloseStack.pop()
          return
        }
        if (VOID_TAGS.has(rawTag) || isImplied) return
        const outTag = opts.closeTag ? opts.closeTag(rawTag) : rawTag
        if (outTag == null) return
        chunks.push(`</${outTag}>`)
      },
      ontext(text) {
        if (skipStack.length === 0) chunks.push(text)
      },
      oncomment(text) {
        if (skipStack.length === 0) chunks.push(`<!--${text}-->`)
      },
    },
    { decodeEntities: false, lowerCaseTags: true, lowerCaseAttributeNames: true }
  )

  parser.write(html)
  parser.end()
  return chunks.join('')
}

// Markdown escape patterns — strip common inline markers
const INLINE_MD_RE = /([*_~=`])\1?|!\[([^\]]*)\]\([^)]*\)|\[([^\]]*)\]\([^)]*\)|!\[\[([^\]]*)\]\]|\[\[([^\]]*)\]\]/g

export const htmlCleanupFilters: BindingFilters = {
  remove_attr: (v, ...attrs) => {
    const html = String(v ?? '')
    const attrSet = new Set(attrs.map((a) => String(a).toLowerCase()))
    return rebuildHtml(html, {
      openTag: (tag, attribs) => {
        const out: Record<string, string> = {}
        for (const [k, val] of Object.entries(attribs)) {
          if (!attrSet.has(k)) out[k] = val
        }
        return { tag, attribs: out }
      },
    })
  },
  remove_tags: (v, ...tags) => {
    const html = String(v ?? '')
    const tagSet = new Set(tags.map((t) => String(t).toLowerCase()))
    return rebuildHtml(html, {
      openTag: (tag, attribs) => (tagSet.has(tag) ? { drop: true } : { tag, attribs }),
      keepContent: () => true,
    })
  },
  replace_tags: (v, ...pairs) => {
    const html = String(v ?? '')
    const map: Record<string, string> = {}
    for (let i = 0; i + 1 < pairs.length; i += 2) {
      map[String(pairs[i]).toLowerCase()] = String(pairs[i + 1])
    }
    return rebuildHtml(html, {
      openTag: (tag, attribs) => ({ tag: map[tag] ?? tag, attribs }),
      closeTag: (tag) => map[tag] ?? tag,
    })
  },
  strip_attr: (v, ...allowList) => {
    const html = String(v ?? '')
    const allowed = new Set(allowList.map((a) => String(a).toLowerCase()))
    return rebuildHtml(html, {
      openTag: (tag, attribs) => {
        const out: Record<string, string> = {}
        for (const [k, val] of Object.entries(attribs)) {
          if (allowed.has(k)) out[k] = val
        }
        return { tag, attribs: out }
      },
    })
  },
  strip_md: (v) => {
    const s = String(v ?? '')
    return s.replace(INLINE_MD_RE, (_match, _marker, imgAlt, linkText, embedTarget, wikiText) => {
      if (imgAlt !== undefined) return imgAlt
      if (linkText !== undefined) return linkText
      if (embedTarget !== undefined) return embedTarget
      if (wikiText !== undefined) return wikiText
      return ''
    })
  },
  strip_tags: (v, ...allowList) => {
    const html = String(v ?? '')
    const allowed = new Set(allowList.map((t) => String(t).toLowerCase()))
    return rebuildHtml(html, {
      openTag: (tag, attribs) => (allowed.has(tag) ? { tag, attribs } : { drop: true }),
      keepContent: () => true,
    })
  },
}
