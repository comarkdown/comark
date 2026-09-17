export type { BindingFilter, BindingFilters, FilterSpec, ParsedBinding } from './types.ts'
export { parseBindingExpression, applyBindingFilters } from './engine.ts'
export { standardFilters } from './standard.ts'

import type { BindingFilters } from './types.ts'
import { standardFilters } from './standard.ts'

/**
 * Merge user-supplied filters over `standardFilters`.
 *
 * Returns `standardFilters` as-is when `userFilters` is empty or absent, so
 * callers can safely memoize the result by reference equality.
 */
export const resolveFilterRegistry = (userFilters?: BindingFilters): BindingFilters =>
  !userFilters || Object.keys(userFilters).length === 0 ? standardFilters : { ...standardFilters, ...userFilters }
