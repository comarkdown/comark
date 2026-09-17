export type BindingFilter = (value: unknown, ...args: unknown[]) => unknown
export type BindingFilters = Record<string, BindingFilter>

export interface FilterSpec {
  name: string
  args: unknown[]
}

export interface ParsedBinding {
  path: string
  filters: FilterSpec[]
}
