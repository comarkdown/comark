/**
 * Etiket plugin for Comark.
 *
 * Converts barcode/QR directive nodes into inline SVG (default), PNG data URI,
 * or SVG data URI **at parse time** using the `etiket` peer dependency. Because
 * generation happens in the `post()` AST hook the resulting nodes are
 * renderer-agnostic — they work in HTML, ANSI, Vue, React, Svelte and Angular
 * with no per-framework component.
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import etiket from 'comark/plugins/etiket'
 *
 * const doc = await parseMarkdown(
 *   '::qrcode{value="https://example.com" dot-type="dots" ec-level="H"}',
 *   { plugins: [etiket()] },
 * )
 * ```
 *
 * Frontmatter defaults (applied before per-directive attrs):
 * ```yaml
 * ---
 * etiket:
 *   output: svg          # svg | img | png
 *   ecLevel: H
 *   color: currentColor
 * ---
 * ```
 *
 * @see https://etiket.productdevbook.com
 */

import type { ElementNode, Node } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { visitAsync, textContent, camelCase } from '../utils/index.ts'
import { svgToNodes } from '../internal/parse/html/index.ts'

// ---------------------------------------------------------------------------
// Public config types
// ---------------------------------------------------------------------------

/** Output mode for generated codes. */
export type EtiketOutput = 'svg' | 'img' | 'png'

/**
 * Options for the etiket plugin factory.
 *
 * All keys in `etiket` are merged as global defaults for every directive
 * (per-directive attrs always take precedence). These are also overridable
 * per-directive-tag in the frontmatter `etiket` object.
 */
export interface EtiketConfig {
  /**
   * Global default etiket options applied to every directive.
   * Per-directive inline attrs always take precedence.
   */
  etiket?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Directive registry
// ---------------------------------------------------------------------------

/** Tags whose etiket function signature is `fn(value, opts?) → SVG string`. */
const SVG_FN: Record<string, string> = {
  qrcode: 'qrcode',
  microqr: 'microqr',
  rmqr: 'rmqr',
  barcode: 'barcode',
  postal: 'postal',
  datamatrix: 'datamatrix',
  gs1datamatrix: 'gs1datamatrix',
  pdf417: 'pdf417',
  micropdf417: 'micropdf417',
  aztec: 'aztec',
  maxicode: 'maxicode',
  dotcode: 'dotcode',
  hanxin: 'hanxin',
  codablockf: 'codablockf',
  code16k: 'code16k',
  jabcode: 'jabcode',
}

/** Maps tag → etiket PNG data-URI function name. jabcode has no PNG support. */
const PNG_URI_FN: Record<string, string> = {
  qrcode: 'qrcodePNGDataURI',
  microqr: 'microqrPNGDataURI',
  rmqr: 'rmqrPNGDataURI',
  barcode: 'barcodePNGDataURI',
  postal: 'postalPNGDataURI',
  datamatrix: 'datamatrixPNGDataURI',
  gs1datamatrix: 'gs1datamatrixPNGDataURI',
  pdf417: 'pdf417PNGDataURI',
  micropdf417: 'micropdf417PNGDataURI',
  aztec: 'aztecPNGDataURI',
  maxicode: 'maxicodePNGDataURI',
  dotcode: 'dotcodePNGDataURI',
  hanxin: 'hanxinPNGDataURI',
  codablockf: 'codablockfPNGDataURI',
  code16k: 'code16kPNGDataURI',
}

/** Maps tag → etiket SVG data-URI function. Most tags fall back to manual base64. */
const DATA_URI_FN: Record<string, string> = {
  qrcode: 'qrcodeDataURI',
  barcode: 'barcodeDataURI',
}

/** Helper directive tags that build structured args before calling etiket. */
const HELPER_TAGS = new Set([
  'qr-wifi', 'qr-email', 'qr-sms', 'qr-geo', 'qr-url', 'qr-phone',
  'qr-vcard', 'qr-mecard', 'qr-event', 'swiss-qr', 'gs1-digital-link',
])

/** Batch directive tags that accept a list of values from child lines or `values` attr. */
const BATCH_FN: Record<string, string> = {
  'barcode-sheet': 'barcodeSheet',
  'qr-sheet': 'qrcodeSheet',
}

const ALL_TAGS = new Set([
  ...Object.keys(SVG_FN),
  ...HELPER_TAGS,
  ...Object.keys(BATCH_FN),
])

// ---------------------------------------------------------------------------
// Option coercion
// ---------------------------------------------------------------------------

const RESERVED_ATTR_KEYS = new Set(['value', 'output', '$', 'class', 'id'])

/**
 * Coerce a raw string attribute value to the appropriate JavaScript type:
 * boolean, number, JSON object/array, or string.
 */
export const coerceValue = (v: unknown): unknown => {
  if (typeof v !== 'string') return v
  if (v === 'true') return true
  if (v === 'false') return false
  const n = Number(v)
  if (v !== '' && !Number.isNaN(n)) return n
  if ((v.startsWith('{') || v.startsWith('[')) && (v.endsWith('}') || v.endsWith(']'))) {
    try {
      return JSON.parse(v)
    } catch {}
  }
  return v
}

/**
 * Convert directive element attrs to etiket option keys.
 *
 * - Strips reserved keys (`value`, `output`, `$`, `class`, `id`).
 * - Converts kebab-case attr names to camelCase.
 * - Handles `:key` attrs from YAML block props: tries JSON.parse for structured
 *   values and skips runtime binding expressions that fail JSON.parse.
 * - Coerces scalar string values to booleans, numbers, or JSON objects.
 */
export const attrsToOpts = (attrs: Record<string, unknown>): Record<string, unknown> => {
  const opts: Record<string, unknown> = {}
  for (const [rawKey, rawVal] of Object.entries(attrs)) {
    let key = rawKey
    let val = rawVal

    if (key.startsWith(':')) {
      key = key.slice(1)
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val)
        } catch {
          // Runtime binding expression — cannot resolve at parse time; skip.
          continue
        }
      }
    }

    if (RESERVED_ATTR_KEYS.has(key)) continue

    opts[camelCase(key)] = coerceValue(val)
  }
  return opts
}

// ---------------------------------------------------------------------------
// Value / batch extraction
// ---------------------------------------------------------------------------

const getDirectiveValue = (attrs: Record<string, unknown>, children: Node[]): string | undefined => {
  if (typeof attrs.value === 'string' && attrs.value.length > 0) return attrs.value
  const text = children.map((c) => textContent(c as Node)).join('').trim()
  return text.length > 0 ? text : undefined
}

const getDirectiveBatch = (attrs: Record<string, unknown>, children: Node[]): string[] => {
  const valuesAttr = attrs.values ?? attrs[':values']
  if (typeof valuesAttr === 'string') {
    try {
      const parsed = JSON.parse(valuesAttr)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {}
  }
  if (Array.isArray(valuesAttr)) return valuesAttr.map(String)
  return children
    .map((c) => textContent(c as Node).trim())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// QR rendering option keys — used to split helper payload fields from QR opts
// ---------------------------------------------------------------------------

const QR_RENDER_KEYS = new Set([
  'size', 'ecLevel', 'version', 'mode', 'mask', 'color', 'background', 'margin',
  'dotType', 'dotSize', 'shape', 'corners', 'logo', 'xmlDeclaration', 'unit',
  'ariaLabel', 'desc',
])

const splitHelperOpts = (
  allOpts: Record<string, unknown>,
): { qrOpts: Record<string, unknown>; fields: Record<string, unknown> } => {
  const qrOpts: Record<string, unknown> = {}
  const fields: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(allOpts)) {
    if (QR_RENDER_KEYS.has(k)) {
      qrOpts[k] = v
    } else {
      fields[k] = v
    }
  }
  return { qrOpts, fields }
}

// ---------------------------------------------------------------------------
// Helper args builders
// ---------------------------------------------------------------------------

const buildHelperArgs = (
  tag: string,
  allOpts: Record<string, unknown>,
): { fn: string; args: unknown[] } => {
  const { qrOpts, fields } = splitHelperOpts(allOpts)

  switch (tag) {
    case 'qr-wifi':
      return { fn: 'wifi', args: [String(fields.ssid ?? ''), String(fields.password ?? ''), qrOpts] }

    case 'qr-email':
      return { fn: 'email', args: [String(fields.address ?? fields.email ?? ''), qrOpts] }

    case 'qr-sms': {
      const args: unknown[] = [String(fields.phone ?? '')]
      if (fields.message !== undefined) args.push(String(fields.message))
      args.push(qrOpts)
      return { fn: 'sms', args }
    }

    case 'qr-geo':
      return { fn: 'geo', args: [Number(fields.lat ?? 0), Number(fields.lng ?? fields.lon ?? 0), qrOpts] }

    case 'qr-url':
      return { fn: 'url', args: [String(fields.url ?? fields.link ?? ''), qrOpts] }

    case 'qr-phone':
      return { fn: 'phone', args: [String(fields.phone ?? ''), qrOpts] }

    case 'qr-vcard':
      return { fn: 'vcard', args: [fields, qrOpts] }

    case 'qr-mecard':
      return { fn: 'mecard', args: [fields, qrOpts] }

    case 'qr-event':
      return { fn: 'event', args: [fields, qrOpts] }

    case 'swiss-qr':
      return { fn: 'swissQR', args: [fields] }

    case 'gs1-digital-link':
      return { fn: 'gs1DigitalLink', args: [fields, qrOpts] }

    default:
      return { fn: 'qrcode', args: ['', qrOpts] }
  }
}

// ---------------------------------------------------------------------------
// Node builders
// ---------------------------------------------------------------------------

const makeImgNode = (src: string, alt: string): ElementNode => [
  'img',
  { src, alt, $: { html: 1, block: 1 } },
]

const makeFallbackNode = (tag: string, value: string): ElementNode => [
  'pre',
  { class: `etiket etiket-error etiket-${tag}` },
  ['code', {}, value],
]

const svgToDataURI = (svg: string): string =>
  `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`

// ---------------------------------------------------------------------------
// Code generator
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EtiketModule = Record<string, (...args: any[]) => unknown>

const callFn = (mod: EtiketModule, fn: string, args: unknown[]): string => {
  if (typeof mod[fn] !== 'function') throw new Error(`etiket.${fn} is not a function`)
  return String(mod[fn](...args))
}

const inlineSvgNode = (svg: string): ElementNode | undefined => {
  const nodes = svgToNodes(svg)
  return nodes.length > 0 ? (nodes[0] as ElementNode) : undefined
}

const generate = (
  mod: EtiketModule,
  tag: string,
  attrs: Record<string, unknown>,
  children: Node[],
  defaults: Record<string, unknown>,
  output: EtiketOutput,
): Node | undefined => {
  // -----------------------------------------------------------------------
  // Batch: ::barcode-sheet, ::qr-sheet
  // -----------------------------------------------------------------------
  if (tag in BATCH_FN) {
    const values = getDirectiveBatch(attrs, children)
    const opts = { ...defaults, ...attrsToOpts(attrs) }
    if (values.length === 0) {
      console.warn(`[comark/plugins/etiket] ${tag} has no values — provide them as child lines or values= attr`)
      return undefined
    }
    const svg = callFn(mod, BATCH_FN[tag], [values, opts])
    return output === 'png' || output === 'img'
      ? makeImgNode(svgToDataURI(svg), `etiket-${tag}`)
      : inlineSvgNode(svg)
  }

  // -----------------------------------------------------------------------
  // Helpers: ::qr-wifi, ::qr-vcard, etc.
  // -----------------------------------------------------------------------
  if (HELPER_TAGS.has(tag)) {
    const allOpts = { ...defaults, ...attrsToOpts(attrs) }
    const { fn, args } = buildHelperArgs(tag, allOpts)
    const svg = callFn(mod, fn, args)
    if (output === 'png' || output === 'img') {
      return makeImgNode(svgToDataURI(svg), `etiket-${tag}`)
    }
    return inlineSvgNode(svg)
  }

  // -----------------------------------------------------------------------
  // Standard 1D/2D: ::qrcode, ::barcode, ::datamatrix, etc.
  // -----------------------------------------------------------------------
  const svgFn = SVG_FN[tag]
  if (!svgFn) return undefined

  const value = getDirectiveValue(attrs, children)
  if (value === undefined) {
    console.warn(`[comark/plugins/etiket] ${tag} requires a value via value= attr or inline content`)
    return undefined
  }

  const opts = { ...defaults, ...attrsToOpts(attrs) }

  // Soft validation — warn but still attempt generation
  try {
    if ((tag === 'qrcode' || tag === 'microqr' || tag === 'rmqr') && typeof mod.validateQRInput === 'function') {
      const res = mod.validateQRInput(value) as { valid?: boolean; error?: string } | undefined
      if (res && res.valid === false) {
        console.warn(`[comark/plugins/etiket] QR validation warning: ${res.error ?? 'invalid input'}`)
      }
    } else if (tag === 'barcode' && opts.type && typeof mod.validateBarcode === 'function') {
      const res = mod.validateBarcode(value, opts.type) as { valid?: boolean; error?: string } | undefined
      if (res && res.valid === false) {
        console.warn(`[comark/plugins/etiket] barcode validation warning: ${res.error ?? 'invalid input'}`)
      }
    }
  } catch {}

  // For PNG output — use the dedicated PNG data-URI function
  if (output === 'png') {
    const pngFn = PNG_URI_FN[tag]
    if (pngFn && typeof mod[pngFn] === 'function') {
      const dataUri = callFn(mod, pngFn, [value, opts])
      return makeImgNode(dataUri, value)
    }
    console.warn(`[comark/plugins/etiket] output=png not supported for ${tag}; using SVG data URI`)
    // fall through to SVG
  }

  // Generate SVG string (shared by svg / img / fallback png)
  const svg = callFn(mod, svgFn, [value, opts])

  if (output === 'img') {
    const dataUriFn = DATA_URI_FN[tag]
    if (dataUriFn && typeof mod[dataUriFn] === 'function') {
      const dataUri = callFn(mod, dataUriFn, [value, opts])
      return makeImgNode(dataUri, value)
    }
    return makeImgNode(svgToDataURI(svg), value)
  }

  if (output === 'png') {
    return makeImgNode(svgToDataURI(svg), value)
  }

  // Default: inline SVG
  return inlineSvgNode(svg)
}

// ---------------------------------------------------------------------------
// Lazy peer-dep loader
// ---------------------------------------------------------------------------

let _etiketModule: EtiketModule | null = null
let _etiketLoadAttempted = false

const loadEtiket = async (): Promise<EtiketModule | null> => {
  if (_etiketLoadAttempted) return _etiketModule
  _etiketLoadAttempted = true
  try {
    _etiketModule = (await import('etiket')) as EtiketModule
    return _etiketModule
  } catch {
    console.warn(
      '[comark/plugins/etiket] Peer dependency "etiket" is not installed. ' +
        'Run `npm install etiket` to enable barcode/QR directives.',
    )
    return null
  }
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

/**
 * Create the etiket plugin for Comark.
 *
 * **Supported directive tags:**
 *
 * | Category | Tags |
 * |---|---|
 * | 1D barcodes | `::barcode{value="..." type="ean13"}` |
 * | Postal | `::postal{value="SN34RD1A" type="rm4scc"}` |
 * | 2D codes | `::qrcode`, `::microqr`, `::rmqr`, `::datamatrix`, `::gs1datamatrix`, `::pdf417`, `::micropdf417`, `::aztec`, `::maxicode`, `::dotcode`, `::hanxin`, `::codablockf`, `::code16k`, `::jabcode` |
 * | QR helpers | `::qr-wifi{ssid=... password=...}`, `::qr-vcard{first-name=... last-name=...}`, `::qr-email`, `::qr-sms`, `::qr-geo`, `::qr-url`, `::qr-phone`, `::qr-mecard`, `::qr-event`, `::swiss-qr`, `::gs1-digital-link` |
 * | Batch sheets | `::barcode-sheet`, `::qr-sheet` |
 *
 * **Option coercion:** kebab-case attrs are converted to camelCase
 * (`dot-type` → `dotType`). String values are coerced to booleans/numbers
 * (`show-text="true"` → `showText: true`). JSON strings are parsed
 * (`color='{"type":"linear",...}'` → object).
 *
 * **Output modes** via `output=` attr or frontmatter `etiket.output`:
 * - `svg` (default) — inline `<svg>` supporting CSS `currentColor` theming
 * - `img` — `<img src="data:image/svg+xml;base64,…">`
 * - `png` — `<img src="data:image/png;base64,…">` (not available for `jabcode`)
 *
 * **Binding limitation:** directive attrs with `:key` that resolve to runtime
 * binding expressions cannot be decoded at parse time. Those directives are
 * left unchanged in the AST.
 */
export default defineComarkPlugin((config: EtiketConfig = {}) => ({
  name: 'etiket',
  async post(state) {
    const mod = await loadEtiket()
    if (!mod) return

    const fmEtiket = (state.tree.frontmatter?.etiket as Record<string, unknown> | undefined) ?? {}
    const globalDefaults: Record<string, unknown> = { ...config.etiket, ...fmEtiket }
    const outputDefault = String(globalDefaults.output ?? 'svg') as EtiketOutput

    await visitAsync(
      state.tree,
      (node) => Array.isArray(node) && ALL_TAGS.has(String((node as ElementNode)[0])),
      (node) => {
        const el = node as ElementNode
        const tag = String(el[0])
        const attrs = el[1] as Record<string, unknown>
        const children = (el as unknown[]).slice(2) as Node[]

        const output = String(attrs.output ?? globalDefaults.output ?? outputDefault) as EtiketOutput

        // Per-tag frontmatter overrides (e.g. frontmatter.etiket.qrcode.ecLevel)
        const perTagDefaults =
          globalDefaults[tag] !== null && typeof globalDefaults[tag] === 'object'
            ? (globalDefaults[tag] as Record<string, unknown>)
            : {}
        const mergedDefaults = { ...globalDefaults, ...perTagDefaults }

        try {
          const result = generate(mod, tag, attrs, children, mergedDefaults, output)
          return result
        } catch (err) {
          console.warn(
            `[comark/plugins/etiket] Failed to generate ${tag}: ${err instanceof Error ? err.message : String(err)}`,
          )
          const value = getDirectiveValue(attrs, children)
          return makeFallbackNode(tag, value ?? tag)
        }
      },
    )
  },
}))
