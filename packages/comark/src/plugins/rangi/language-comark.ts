/**
 * Comark grammar for the `rangi` highlighter.
 *
 * Based on rangi's official markdown grammar
 * ({@link https://github.com/pi0/rangi/blob/main/src/languages/md.ts}), extended
 * with the Comark syntax: YAML frontmatter, block components (`::name`),
 * inline components (`:name`), spans (`[text]{attrs}`), inline attributes
 * (`{.class #id key=value}`), bindings (`{{ value || default }}`), named slots
 * (`#slot`), alerts (`> [!NOTE]`) and task lists.
 *
 * Rules are plain tuples — `[match, type, sub]` — evaluated by rangi's engine,
 * which always takes the *earliest* match in the source and, on equal
 * positions, the rule that comes first in this array. Comark rules are
 * therefore listed before the markdown ones so they win ties (`# Title{#id}`
 * over a plain heading, `[text]{.c}` over a link, …).
 *
 * The token types are given by name rather than by rangi's numeric constants:
 * the constants are internal to the grammars it bundles, and a name is what
 * a theme keys its colors by.
 */

import type { ShjLanguageComponent, ShjLanguageDefinition, ShjLanguages, ShjMatcher } from 'rangi'

/** A component name: same grammar as `RE_COMPONENT_NAME` in the parser. */
const NAME = '[a-z$][\\w$-]*'

/** A `{...}` attributes block, quote aware so `{title="a } b"}` stays whole. */
const ATTRS = '\\{(?:[^{}\'"]|\'[^\']*\'|"[^"]*")*\\}'

/** A `[...]` slot / span body. */
const SLOT = '\\[[^\\]]*\\]'

/**
 * The inside of a `{...}` block: `.class` / `#id` shorthands, `key=value`
 * pairs (including `:bound` and `@event` prefixes) and the braces themselves.
 */
const attributeRules: ShjLanguageDefinition = [
  [/^\{|\}$/g, 'oper'],
  [/[.#][^\s.#}='"]+/g, 'class'],
  [/=\s*("[^"]*"?|'[^']*'?|`[^`]*`?|[^\s}]+)/g, 'str', [[/^=/g, 'oper']]],
  [/[:@]?[a-z_$][\w$-]*/gi, 'var'],
]

/**
 * The inside of a component marker, shared by the block and the inline form:
 * the colons, the component name, its attributes and its inline slot.
 */
const componentRules: ShjLanguageDefinition = [
  [/:+/g, 'oper'],
  [RegExp(`(?<=:)${NAME}`, 'gi'), 'class'],
  [RegExp(ATTRS, 'g'), undefined, attributeRules],
  [RegExp(SLOT, 'g'), undefined, [[/^\[|\]$/g, 'oper']]],
]

const RE_FRONTMATTER = /^---[ \t]*\r?\n[^]*?\r?\n---[ \t]*(?=\r?\n|$)/

/**
 * Frontmatter is only frontmatter at the very top of the document — anywhere
 * else `---` is a thematic break. A regex cannot say "start of input" while
 * the engine drives `lastIndex`, so this is the {@link ShjMatcher} escape
 * hatch: it matches at offset `0` and never again, and the engine drops it
 * from the rule set as soon as it returns `null`.
 */
const frontmatterMatcher: ShjMatcher = {
  lastIndex: 0,
  exec(source: string) {
    if (this.lastIndex > 0) return null
    const match = RE_FRONTMATTER.exec(source)
    if (!match) return null
    this.lastIndex = match[0].length
    return match
  },
}

/** ```` ```lang ```` and `~~~lang` fences, highlighted with the fenced language. */
function fence(marker: '`' | '~'): ShjLanguageComponent {
  const char = marker === '`' ? '`' : '~'
  return [
    RegExp(`^(${char}{3,})(.*)\\n[^]*?^\\1[ \\t]*$`, 'gm'),
    undefined,
    (code: string) => [
      undefined,
      'kwd',
      // the fence says what it holds, or it is left plain: guessing at the
      // content of an undeclared fence is not worth pulling `detectLanguage` in
      [
        [
          RegExp(`\\n[^]*(?=^${char}+[ \\t]*$)`, 'gm'),
          undefined,
          code.split('\n')[0]?.match(RegExp(`^${char}+\\s*(\\S*)`))?.[1],
        ],
      ],
    ],
  ]
}

export const comarkLanguage: ShjLanguageDefinition = [
  // #region Comark

  // YAML frontmatter — `---` … `---` at the top of the document
  [
    frontmatterMatcher,
    undefined,
    [
      [/^---[ \t]*$/gm, 'oper'],
      [/[^]+(?=\r?\n---)/g, undefined, 'yaml'],
    ],
  ],

  // Block component YAML props — a `---` block on the line right after the
  // opening marker. Anywhere else `---` is a thematic break, which is why this
  // is anchored on the marker rather than matched on its own.
  [
    /(?<=^[ \t]*:{2,}[^\n]*\n)---[ \t]*\n[^]*?\n---[ \t]*$/gm,
    undefined,
    [
      [/^---[ \t]*$/gm, 'oper'],
      [/[^]+(?=\r?\n---)/g, undefined, 'yaml'],
    ],
  ],

  // Block component — `::name{attrs}[slot]`, `:::name`, …
  [RegExp(`^[ \\t]*:{2,}${NAME}(?:${ATTRS})?(?:${SLOT})?(?:${ATTRS})?[ \\t]*$`, 'gim'), undefined, componentRules],

  // Block component terminator — a line of colons on its own
  [/^[ \t]*:{2,}[ \t]*$/gm, 'oper'],

  // Named slot — `#header` on its own line (a heading needs a space after `#`)
  [/^[ \t]*#[\w$-]+[ \t]*$/gm, 'var'],

  // Inline component — `:name`, `:name{attrs}`, `:name[slot]{attrs}`
  [
    RegExp(`(?<=^|[\\s*_[(]):${NAME}(?:${ATTRS})?(?:${SLOT})?(?:${ATTRS})?(?![\\w$:-])`, 'gim'),
    undefined,
    componentRules,
  ],

  // Span — `[text]{attrs}` (without attributes it is a link, or plain text)
  [
    RegExp(`${SLOT}${ATTRS}`, 'g'),
    undefined,
    [
      [RegExp(`^${SLOT}`, 'g'), 'oper'],
      [RegExp(ATTRS, 'g'), undefined, attributeRules],
    ],
  ],

  // Binding — `{{ user.name || Anonymous }}`
  [
    /\{\{[^{}]*\}\}/g,
    'oper',
    [
      [/\|\|/g, 'oper'],
      [/(?<=\|\|)[^]+(?=\}\}$)/g, 'str'],
      [/(?<=^\{\{)[^|}]+/g, 'var'],
    ],
  ],

  // Heading carrying attributes — `## Title{#slug .lead}`
  // The title is `[^{\n]*` (never `.*?[ \t]*`): both `.*?` and `[ \t]*` can
  // match spaces, which made the rule backtrack catastrophically on headings
  // with long space runs and no `{...}` block.
  [
    RegExp(`^ {0,3}#{1,6}[ \\t]+[^\\n{]*${ATTRS}[ \\t]*$`, 'gm'),
    'section',
    [[RegExp(`${ATTRS}[ \\t]*$`, 'g'), undefined, attributeRules]],
  ],

  // Alert — `> [!NOTE]`
  [/^[ \t]{0,3}>[ \t]*\[![a-z]+\][ \t]*$/gim, 'cmnt', [[/\[![a-z]+\]/gi, 'kwd']]],

  // Task list checkbox — `- [x] done`
  [/(?<=^[ \t]*[*+-][ \t]+)\[[ xX]\]/gm, 'bool'],

  // `-` / `+` bullets, which the markdown grammar leaves to `*` and `1.`
  [/^[ \t]*[-+](?=[ \t])/gm, 'kwd'],

  // HTML comment
  [/<!--[^]*?-->/g, 'cmnt'],

  // Emoji shortcode — `:tada:`
  [/(?<![\w:]):[a-z\d_+-]+:(?![\w:])/g, 'esc'],

  // #endregion

  // #region Markdown (rangi's own grammar)

  [/^ {0,3}(?:#{1,6}(?:[ \t]+.*)?|.+\n {0,3}(?:=+|-+)[ \t]*)$/gm, 'section'],
  [/^>.*|^(=|-)\1+$/gm, 'cmnt'],
  [/\*\*.*?\*\*/g, 'class'],
  fence('`'),
  fence('~'),
  [/`[^`]*`/g, 'str'],
  [/~~.*?~~/g, 'var'],
  [/\b_\S([^\n]*?\S)?_\b|\*\S([^\n]*?\S)?\*/g, 'kwd'],
  [/^\s*(\*|\d+\.)\s/gm, 'kwd'],
  [/\[[^\]]*]\([^)]*\)|<[^>]*>/g, 'func', [[/^\[[^\]]*]/g, 'oper']]],

  // #endregion

  // Inline attributes — `**bold**{.accent}`, `![alt](img.png){width=64}`, …
  // Last, so any construct able to own the braces claims them first.
  [RegExp(ATTRS, 'g'), undefined, attributeRules],
]

/** The Comark grammar registered under every supported Markdown fence alias. */
export const comarkLanguages: ShjLanguages = {
  comark: comarkLanguage,
  mdc: comarkLanguage,
  md: comarkLanguage,
  markdown: comarkLanguage,
}

export default comarkLanguage
