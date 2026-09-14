import type { BindingFilters } from './types.ts'
import { textFilters } from './text.ts'
import { numbersFilters } from './numbers.ts'
import { datesFilters } from './dates.ts'
import { collectionsFilters } from './collections.ts'
import { formattingFilters } from './formatting.ts'
import { htmlCleanupFilters } from './html-cleanup.ts'

/**
 * The built-in standard filter catalog.
 *
 * Inspired by the knap standard-filter library (https://knap.md/filters,
 * https://github.com/obsidianmd/knap). Adapted to comark's
 * `(value: unknown, ...args: unknown[]) => unknown` contract.
 *
 * Categories: Text, Numbers, Dates, Collections, Formatting, HTML cleanup.
 *
 * DOM-heavier HTML parsing filters (`html_to_json`, `remove_html`) are
 * intentionally excluded. Import them from `comark/utils/filters/html`.
 */
export const standardFilters: BindingFilters = {
  ...textFilters,
  ...numbersFilters,
  ...datesFilters,
  ...collectionsFilters,
  ...formattingFilters,
  ...htmlCleanupFilters,
}
