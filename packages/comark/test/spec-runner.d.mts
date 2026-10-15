/**
 * Ambient types for the portable zero-dep SPEC runner (`spec-runner.mjs`).
 * Keep in sync with the runtime exports used by Vitest / typecheck.
 */

export interface SpecOptions {
  bold: boolean
  italic: boolean
  boldItalic: boolean
  inlineCode: boolean
  strikethrough: boolean
  links: boolean
  images: boolean
  linkMode: 'protocol' | 'text-only' | string
  incompleteLinkPlaceholder: string
  incompleteImagePlaceholder: string
  blockMath: boolean
  inlineMath: boolean
  htmlTags: boolean
  tables: boolean
  singleTilde: boolean
  comparisonOperators: boolean
  dropTrailingOpeners: boolean
  setextGuard: boolean
  streaming: boolean
  [key: string]: unknown
}

export interface SpecCase {
  position: number
  section: string
  input: string
  expected: string
  options: SpecOptions
}

export interface SpecResult {
  case: SpecCase
  actual: string
  passed: boolean
  durationMs: number
  error?: string
}

export interface SectionSummary {
  section: string
  total: number
  passed: number
  failed: number
  matchRate: number
  durationMs: number
}

export interface RunSummary {
  total: number
  passed: number
  failed: number
  matchRate: number
  durationMs: number
  meanMs: number
  medianMs: number
  opsPerSec: number
  bySection: SectionSummary[]
  failures: SpecResult[]
  results: SpecResult[]
}

export interface CandidateSummary extends RunSummary {
  name: string
}

export interface RankingEntry {
  name: string
  matchRate: number
  passed: number
  failed: number
  durationMs: number
  meanMs: number
  opsPerSec: number
}

export interface CompareReport {
  filePath: string
  caseCount: number
  candidates: CandidateSummary[]
  ranking: RankingEntry[]
}

export type SpecFn = (input: string, opts: SpecOptions) => string

export type SpecCandidate = SpecFn | { name: string; fn: SpecFn }

export type MapOptions = (opts: SpecOptions, testCase: SpecCase) => SpecOptions

export interface SelectOptions {
  section?: string | RegExp | string[]
  filter?: (testCase: SpecCase) => boolean
  verbose?: boolean
  warmup?: number
  mapOptions?: MapOptions
  printSummary?: boolean
}

export const DEFAULT_SPEC_OPTIONS: SpecOptions

export function resetLegacyWarnings(): void
export function parseOptsAttribute(raw: string): Partial<SpecOptions>
export function resolveOptions(overrides?: Partial<SpecOptions>): SpecOptions
export function applySectionHints(section: string, opts: SpecOptions): SpecOptions
export function decodeEscapes(s: string): string
export function parseSpecCases(md: string, filePath?: string): SpecCase[]
export function loadSpecCases(filePath: string): SpecCase[]
export function matchesSection(sectionTitle: string, filter: string | RegExp | string[]): boolean
export function selectCases(cases: SpecCase[], options?: SelectOptions): SpecCase[]
export function runSpecCases(cases: SpecCase[], fn: SpecFn, options?: SelectOptions): RunSummary
export function printCompareTable(report: CompareReport): void
export function formatCompareMarkdown(report: CompareReport): string
export function compareSpecFile(filePath: string, candidates: SpecCandidate[], options?: SelectOptions): CompareReport
export function toGenericAutoCloseOptions(opts: SpecOptions): Record<string, unknown>
export function sectionAwareMapOptions(opts: SpecOptions, testCase: SpecCase): SpecOptions
