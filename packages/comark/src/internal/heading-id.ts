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
  return { nested: option !== 'flat', slugCounts: new Map(), usedIds: new Set(), stack: [] }
}

/**
 * Convert text to a slug for heading IDs
 * Example: "Hello World" -> "hello-world"
 * Example: "1. Introduction" -> "_1-introduction"
 */
export function slugify(text: string): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-word chars (except hyphens)
    .replace(/-{2,}/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  // Prefix with underscore if starts with a digit (HTML IDs can't start with numbers)
  if (/^\d/.test(slug)) {
    slug = '_' + slug
  }

  return slug
}

/**
 * Return the auto-generated id for the next heading, suffixed with a counter
 * for duplicates. In nested mode it is also prefixed with its parent heading's
 * id (h2+ parents only).
 */
export function nextHeadingId(text: string, level: number, tracker: HeadingIdTracker): string {
  let slug = slugify(text)
  const { stack, slugCounts, usedIds } = tracker

  if (tracker.nested) {
    // Pop headings at same level or deeper
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }
    // Use parent's full ID as prefix (h1 doesn't prefix children)
    if (stack.length > 0) {
      const parent = stack[stack.length - 1]
      if (parent.level >= 2) {
        slug = parent.id + '-' + slug
      }
    }

    // Push onto stack for child headings to reference
    stack.push({ level, id: slug })
  }

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
