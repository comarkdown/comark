import { dump } from 'js-yaml'
import type { BindingFilters } from './types.ts'

const str = (v: unknown): string => (v == null ? '' : String(v))

const prefixLines = (text: string, prefix: string): string =>
  text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n')

const escapeMarkdown = (s: string): string => {
  const MD_CHARS = '\\`*_{}[]()#+-.!|~>'
  let result = ''
  for (let i = 0; i < s.length; i++) {
    if (MD_CHARS.includes(s[i])) result += '\\'
    result += s[i]
  }
  return result
}

const toList = (v: unknown, marker = '-'): string => {
  const arr = Array.isArray(v) ? v : [v]
  return arr.map((item) => `${marker} ${str(item)}`).join('\n')
}

const toTable = (v: unknown, pretty = false): string => {
  const arr = Array.isArray(v) ? v : [v]
  if (!arr.length) return ''
  const first = arr[0]
  if (first == null || typeof first !== 'object' || Array.isArray(first)) {
    // Array of primitives — single-column table
    const rows = arr.map((item) => str(item))
    const header = 'Value'
    const sep = pretty ? '-'.repeat(Math.max(header.length, ...rows.map((r) => r.length))) : '---'
    return [`| ${header} |`, `| ${sep} |`, ...rows.map((r) => `| ${r} |`)].join('\n')
  }
  // Array of objects
  const keys = Array.from(new Set(arr.flatMap((item) => Object.keys(item as Record<string, unknown>))))
  if (!keys.length) return ''
  const rows = arr.map((item) => keys.map((k) => str((item as Record<string, unknown>)[k])))
  if (pretty) {
    const widths = keys.map((k, i) => Math.max(k.length, ...rows.map((r) => r[i].length)))
    const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))
    const header = `| ${keys.map((k, i) => pad(k, widths[i])).join(' | ')} |`
    const sep = `| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |`
    const body = rows.map((r) => `| ${r.map((cell, i) => pad(cell, widths[i])).join(' | ')} |`)
    return [header, sep, ...body].join('\n')
  }
  const header = `| ${keys.join(' | ')} |`
  const sep = `| ${keys.map(() => '---').join(' | ')} |`
  const body = rows.map((r) => `| ${r.join(' | ')} |`)
  return [header, sep, ...body].join('\n')
}

const toYaml = (v: unknown): string => {
  if (v == null) return ''
  const out = dump(v, { indent: 2, lineWidth: -1 })
  return out.replace(/\n$/, '')
}

const heading = (level: number) => (v: unknown) => `${'#'.repeat(level)} ${str(v)}`

export const formattingFilters: BindingFilters = {
  blockquote: (v) => prefixLines(str(v), '> '),
  bold: (v) => `**${str(v)}**`,
  callout: (v, type, title) => {
    const t = type != null ? str(type) : 'note'
    const heading = title != null ? ` ${str(title)}` : ''
    return `> [!${t}]${heading}\n${prefixLines(str(v), '> ')}`
  },
  code: (v, lang) => {
    if (lang != null) {
      const fence = '```'
      return `${fence}${str(lang)}\n${str(v)}\n${fence}`
    }
    return `\`${str(v)}\``
  },
  code_block: (v, lang = '') => {
    const fence = '```'
    return `${fence}${str(lang)}\n${str(v)}\n${fence}`
  },
  comment: (v) => `<!-- ${str(v)} -->`,
  embed: (v) => `![[${str(v)}]]`,
  escape_md: (v) => escapeMarkdown(str(v)),
  footnote: (v, label) => {
    if (Array.isArray(v)) {
      return v
        .map((item, i) => {
          const lbl = label != null ? `${str(label)}-${i + 1}` : String(i + 1)
          return `[^${lbl}]: ${str(item)}`
        })
        .join('\n')
    }
    const lbl = label != null ? str(label) : '1'
    return `[^${lbl}]: ${str(v)}`
  },
  fragment_link: (v, url, text) => {
    const displayText = text != null ? str(text) : str(v)
    const base = url != null ? str(url) : ''
    const fragment = encodeURIComponent(str(v)).replace(/%20/g, '%20')
    return `[${displayText}](${base}#:~:text=${fragment})`
  },
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
  hard_break: (v) => str(v).split('\n').join('  \n'),
  highlight: (v) => `==${str(v)}==`,
  hr: (v, position) => {
    const s = str(v)
    const pos = position != null ? str(position) : 'after'
    if (pos === 'before') return `---\n${s}`
    if (pos === 'both') return `---\n${s}\n---`
    return `${s}\n---`
  },
  image: (v, alt, url) => {
    if (url != null) return `![${str(alt ?? '')}](${str(url)})`
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      const obj = v as Record<string, unknown>
      return `![${str(obj.alt ?? obj.title ?? '')}](${str(obj.url ?? obj.src ?? '')})`
    }
    if (Array.isArray(v)) {
      return v
        .map((item) => {
          if (item != null && typeof item === 'object') {
            const o = item as Record<string, unknown>
            return `![${str(o.alt ?? o.title ?? '')}](${str(o.url ?? o.src ?? '')})`
          }
          return `![](${str(item)})`
        })
        .join('\n')
    }
    return `![${str(alt ?? '')}](${str(v)})`
  },
  italic: (v) => `*${str(v)}*`,
  link: (v, urlOrText, url) => {
    if (url != null) return `[${str(urlOrText)}](${str(url)})`
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      const obj = v as Record<string, unknown>
      return `[${str(obj.title ?? obj.text ?? obj.label ?? '')}](${str(obj.url ?? obj.href ?? '')})`
    }
    if (Array.isArray(v)) {
      return v
        .map((item) => {
          if (item != null && typeof item === 'object') {
            const o = item as Record<string, unknown>
            return `[${str(o.title ?? o.text ?? o.label ?? '')}](${str(o.url ?? o.href ?? '')})`
          }
          return `[${str(item)}](${str(item)})`
        })
        .join('\n')
    }
    const text = urlOrText != null ? str(urlOrText) : str(v)
    return `[${text}](${str(v)})`
  },
  list: (v, marker) => toList(v, marker != null ? str(marker) : '-'),
  math: (v) => `$${str(v)}$`,
  math_block: (v) => `$$\n${str(v)}\n$$`,
  strike: (v) => `~~${str(v)}~~`,
  table: (v) => toTable(v, false),
  table_pretty: (v) => toTable(v, true),
  wikilink: (v, alias) => {
    if (Array.isArray(v)) return v.map((item) => `[[${str(item)}]]`).join('\n')
    const target = str(v)
    return alias != null ? `[[${target}|${str(alias)}]]` : `[[${target}]]`
  },
  yaml: (v) => toYaml(v),
  yaml_property: (v, key) => {
    if (key == null) return toYaml(v)
    return `${str(key)}: ${toYaml(v)}`
  },
}
