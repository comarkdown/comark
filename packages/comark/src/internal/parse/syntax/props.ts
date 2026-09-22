const bracketPairs = {
  '[': ']',
  '{': '}',
  '(': ')',
}
const quotePairs = {
  "'": "'",
  '"': '"',
  '`': '`',
}

export function parseProps(content: string) {
  content = content.trim()
  if (!content) return undefined
  const props = searchProps(content)
  if (!props) throw new Error(`Invalid props: \`${content}\``)
  if (props.index !== content.length)
    throw new Error(`Invalid props: \`${content}\`, expected end \`}\` but got \`${content.slice(props.index)}\``)
  return props.props
}

export function searchProps(content: string, index = 0) {
  if (content[index] !== '{') throw new Error(`Invalid props, expected \`{\` but got '${content[index]}'`)

  const props: [string, string][] = []

  // Skip Vue mustache `{{ }}` syntax
  if (content[index + 1] === '{') return undefined

  index += 1

  while (index < content.length) {
    if (content[index] === '\\') {
      index += 2
    } else if (content[index] === '}') {
      index += 1
      break
    } else if (content[index] === ' ') {
      index += 1
    } else if (content[index] === '.') {
      index += 1
      props.push(['class', searchUntil(' #.}', true)])
    } else if (content[index] === '#') {
      index += 1
      props.push(['id', searchUntil(' #.}')])
    } else {
      const start = index
      while (index < content.length) {
        index += 1
        if (' }='.includes(content[index])) break
      }
      const char = content[index]
      if (start !== index) {
        let key = content.slice(start, index).trim()
        let value = ''
        if (char === '=') {
          index += 1
          value = searchValue()
        } else {
          key = key[0] === ':' ? key : `:${key}`
          value = 'true'
        }
        if (key.match(/^:?[a-z_][a-z0-9_-]*$/gi)) {
          props.push([key, value])
        }
      }
    }
  }

  function searchUntil(str: string, bracketAware = false) {
    const start = index
    while (index < content.length) {
      index += 1
      if (content[index] === '\\') index += 2
      // Tailwind-style arbitrary values (e.g. bg-[#000], text-[1.5rem]) keep
      // `.` / `#` inside balanced brackets from being treated as new props.
      // Unbalanced brackets fall through so outer terminators (esp. `}`) still win.
      if (bracketAware && content[index] in bracketPairs) {
        const open = index
        if (searchBracket(bracketPairs[content[index] as keyof typeof bracketPairs])) continue
        index = open
      }
      if (str.includes(content[index])) break
    }
    return content.slice(start, index)
  }

  function searchValue() {
    const start = index
    if (content[index] in bracketPairs) {
      searchBracket(bracketPairs[content[index] as keyof typeof bracketPairs])
      index += 1
      return content.slice(start, index)
    } else if (content[index] in quotePairs) {
      searchString(quotePairs[content[index] as keyof typeof quotePairs])
      index += 1
      return content.slice(start, index)
    } else {
      return searchUntil(' }')
    }
  }

  /** Scan a bracket group starting at the current opener. Returns true if closed. */
  function searchBracket(end: string): boolean {
    while (index < content.length) {
      index++
      if (content[index] in quotePairs) searchString(quotePairs[content[index] as keyof typeof quotePairs])
      else if (content[index] in bracketPairs) {
        if (!searchBracket(bracketPairs[content[index] as keyof typeof bracketPairs])) return false
      } else if (content[index] === end) return true
    }
    return false
  }

  function searchString(end: string) {
    return searchUntil(end)
  }

  // Strip surrounding quotes from values
  props.forEach((v) => {
    if (/^(['"`]).*\1$/.test(v[1])) v[1] = v[1].slice(1, -1)
  })

  return {
    props,
    index,
  }
}
