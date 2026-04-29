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
      props.push(['class', searchUntil(' #.}')])
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
        const key = content.slice(start, index).trim()
        if (char === '=') {
          index += 1
          props.push([key, searchValue()])
        } else {
          props.push([key, 'true'])
        }
      }
    }
  }

  function searchUntil(str: string) {
    const start = index
    while (index < content.length) {
      index += 1
      if (content[index] === '\\') index += 2
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

  function searchBracket(end: string) {
    while (index < content.length) {
      index++
      if (content[index] in quotePairs) searchString(quotePairs[content[index] as keyof typeof quotePairs])
      else if (content[index] in bracketPairs) searchBracket(bracketPairs[content[index] as keyof typeof bracketPairs])
      else if (content[index] === end) return
    }
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
