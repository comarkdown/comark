import type { HeadingIdsOption } from 'comark'

/**
 * Auto-generated heading ids. Shared by the parser (to assign ids) and the
 * markdown stringifier (to tell whether a heading's id is the implicit one or
 * must be written back as `{#id}`). Both walk headings in document order, so
 * they build the same hierarchy and duplicate counts.
 */
export interface HeadingIdTracker {
  nested: boolean
  slugCounts: Map<string, number>
  /** Every id handed out so far, so a suffixed id never collides with a literal one (`Foo`, `Foo`, `Foo-1`) */
  usedIds: Set<string>
  stack: Array<{ level: number; id: string }>
}

/**
 * Create a tracker for the given `headingIds` option, or `undefined` when
 * auto-generated ids are disabled.
 */
export function createHeadingIdTracker(option: HeadingIdsOption = true): HeadingIdTracker | undefined {
  if (option === false) return undefined
  return { nested: option === 'nested', slugCounts: new Map(), usedIds: new Set(), stack: [] }
}

/**
 * Convert text to a slug for heading IDs.
 * Example: "Hello World" -> "hello-world"
 * Example: "1. Introduction" -> "_1-introduction"
 * Example: "Café" -> "café"
 *
 * Keeps Unicode letters, marks, decimal digits, and letter numbers. A combining mark is
 * dropped wherever it would lead, so the result is a valid HTML5 id (NameStartChar is a
 * letter or `_`, never a mark).
 */
export function slugify(text: string): string {
  let slug = text
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    // Keep Unicode letters, marks, decimal digits and letter numbers; drop the rest.
    // Other numbers (No: ①, ½, ²) are not valid HTML5 id or CSS ident characters.
    .replace(/[^\p{L}\p{M}\p{Nd}\p{Nl}_-]+/gu, '')
    .replace(/-{2,}/g, '-') // Replace multiple hyphens with single hyphen
    // Drop a leading run of marks and hyphens, plus trailing hyphens. Marks and
    // hyphens only ever expose each other (`\u0301-1` would otherwise survive as
    // "-1"), so one alternation covers the run.
    .replace(/^(?:\p{M}+|-+)+|-+$/gu, '')

  // Prefix an ASCII leading digit. `#123` is not a valid CSS ident; a non-ASCII
  // digit (U+0660 ARABIC-INDIC DIGIT ZERO and friends) is, so it is left as-is.
  if (slug.charCodeAt(0) >= 48 && slug.charCodeAt(0) <= 57) {
    slug = '_' + slug
  }

  return slug
}

/**
 * Reserve a heading's effective id when a user-supplied `id` overrides the
 * generated one, so later generated ids get a suffix instead of reusing it
 * (`# Foo {#foo-1}` then `# Foo` → `foo-1`, `foo-2`).
 */
export function reserveHeadingId(tracker: HeadingIdTracker, id: unknown): void {
  if (typeof id === 'string' && id) tracker.usedIds.add(id)
}

/**
 * Return the auto-generated id for the next heading, suffixed with a counter
 * for duplicates. In nested mode it is also prefixed with its parent heading's
 * id (h2+ parents only). Returns `undefined` when the heading text slugifies to
 * nothing (emoji, punctuation only) — such a heading gets no id.
 */
export function nextHeadingId(text: string, level: number, tracker: HeadingIdTracker): string | undefined {
  let slug = slugify(text)
  const { stack, slugCounts, usedIds } = tracker

  if (tracker.nested) {
    // Pop headings at same level or deeper
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }
    // Use parent's full ID as prefix (h1 doesn't prefix children). Skip the
    // composition when either side is empty, so a symbol-only parent or child
    // never yields a degenerate id like "-café" or "setup-".
    if (stack.length > 0) {
      const parent = stack[stack.length - 1]
      if (parent.level >= 2 && parent.id && slug) {
        slug = parent.id + '-' + slug
      }
    }

    // Push onto stack for child headings to reference
    stack.push({ level, id: slug })
  }

  if (!slug) return undefined

  let count = slugCounts.get(slug) ?? 0
  let id = count === 0 ? slug : `${slug}-${count}`
  while (usedIds.has(id)) {
    count++
    id = `${slug}-${count}`
  }
  slugCounts.set(slug, count + 1)
  usedIds.add(id)
  return id
}
