import type { ElementNode, Node } from 'comark'

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/** Structural transforms applied to plain markdown elements. */
export interface ProseElementsOptions {
  /**
   * Which heading levels get an anchor link wrapping their content.
   * Defaults to `h2`, `h3` and `h4`. Headings without an `id` are never wrapped.
   */
  headingAnchors?: boolean | Partial<Record<HeadingTag, boolean>>
  /**
   * Icon rendered inside the heading anchor.
   * - `undefined` (default): a self-contained inline SVG (lucide hash)
   * - `string`: a class name placed on a `<span>` (e.g. an Iconify/UnoCSS icon class)
   * - `Node`: an arbitrary element node inserted as-is
   * - `false`: no icon
   */
  anchorIcon?: false | string | ElementNode
  /**
   * Wrap tables in a scroll container so wide tables overflow horizontally.
   * Defaults to `<div class="prose-table">`. Set `false` to disable.
   */
  tableWrapper?: false | { tag?: string; class?: string }
}

/** Copy button options. */
export interface ProseCopyOptions {
  /** `aria-label` of the copy button. @default 'Copy code' */
  label?: string
}

/** Which component tags get lowered into plain HTML. All default to `true`. */
export interface ProseComponentsOptions {
  /** `::callout`, `::note`, `::tip`, `::warning`, `::caution` and GFM alerts (`> [!NOTE]`). */
  callout?: boolean
  /** `::tabs` with `::tab-item{label}` children. */
  tabs?: boolean
  /** `::code-group` — code fences become tab panels labelled by filename/language. */
  codeGroup?: boolean
  /** `::steps{level}` — numbered steps derived from child headings, pure CSS. */
  steps?: boolean
  /** `::accordion` with `::accordion-item{label}` children — native `<details name>`. */
  accordion?: boolean
  /** Copy button injected into every code block (needs the client runtime). */
  copy?: boolean | ProseCopyOptions
}

export type ProseClassValue = string | ((node: ElementNode) => string | undefined)

export interface ProseOptions {
  /** Structural element transforms. `false` disables the whole pass. */
  elements?: false | ProseElementsOptions
  /** Component lowering to plain HTML + custom elements. `false` disables the whole pass. */
  components?: false | ProseComponentsOptions
  /**
   * Optional class map for utility-class design systems: adds classes to plain HTML tags
   * (e.g. `{ p: 'my-5 leading-7' }`). Omit it to style with a stylesheet instead
   * (`@comark/prose/components.css`, Tailwind Typography, shadcn Typeset, ...).
   */
  classes?: Partial<Record<string, ProseClassValue>>
  /**
   * Merges a theme class with the author's class attribute.
   * Defaults to string concatenation. Design-system presets can inject
   * `tailwind-merge`-style merging here.
   */
  mergeClass?: (theme: string, author: unknown) => string
  /**
   * Escape hatch: per-tag transform running before the built-in ones.
   * Return a `Node` to replace the node (built-ins are skipped), `false` to
   * remove it, or `undefined` to fall through to the built-in transforms.
   */
  transform?: Partial<Record<string, (node: ElementNode) => Node | false | undefined>>
}

/** Shared state for one document lowering pass. */
export interface ProseContext {
  elements: ProseElementsOptions | false
  components: ProseComponentsOptions | false
  classes: Partial<Record<string, ProseClassValue>> | undefined
  mergeClass: (theme: string, author: unknown) => string
  transform: Partial<Record<string, (node: ElementNode) => Node | false | undefined>> | undefined
  copy: ProseCopyOptions | false
  /** Deterministic per-document id factory (stable across streaming re-parses). */
  nextId: (kind: string) => string
}
