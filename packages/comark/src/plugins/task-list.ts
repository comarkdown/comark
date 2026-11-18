/**
 * Custom task list plugin for markdown-it that integrates with Comark components.
 *
 * This plugin runs before inline parsing to prevent components from interpreting
 * task list markers [X] and [ ] as Comark inline span syntax.
 */

import { defineComarkPlugin } from '../utils/helpers.ts'

interface MarkdownItToken {
  type: string
  tag: string
  attrs: Array<[string, string]> | null
  map: [number, number] | null
  nesting: number
  level: number
  children: MarkdownItToken[] | null
  content: string
  markup: string
  info: string
  meta: any
  block: boolean
  hidden: boolean
  attrIndex: (name: string) => number
  attrPush: (attr: [string, string]) => void
  attrSet: (name: string, value: string) => void
  attrGet: (name: string) => string | null
  attrJoin: (name: string, value: string) => void
}

interface MarkdownItState {
  src: string
  env: any
  tokens: MarkdownItToken[]
  Token: any
}

interface MarkdownItCore {
  ruler: {
    before: (beforeName: string, ruleName: string, fn: (state: MarkdownItState) => void) => void
  }
}

interface MarkdownIt {
  core: MarkdownItCore
}

interface TaskListOptions {
  enabled?: boolean
  label?: boolean
  labelAfter?: boolean
}

function attrSet(token: MarkdownItToken, name: string, value: string) {
  const index = token.attrIndex(name)
  const attr: [string, string] = [name, value]

  if (index < 0) {
    if (!token.attrs) {
      token.attrs = []
    }
    token.attrs.push(attr)
  } else {
    token.attrs![index] = attr
  }
}

function markdownItTaskList(md: MarkdownIt, options?: TaskListOptions) {
  const disableCheckboxes = !(options?.enabled ?? false)

  md.core.ruler.before('inline', 'task-lists-mdc', (state: MarkdownItState) => {
    const tokens = state.tokens

    // Track open list items and their enclosing lists in one forward pass;
    // scanning backwards per inline token would make list-free documents O(n^2).
    const openItems: number[] = []
    const openItemLists: number[] = []
    const openLists: number[] = []

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
        openLists.push(i)
        continue
      }
      if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
        openLists.pop()
        continue
      }
      if (token.type === 'list_item_open') {
        openItems.push(i)
        openItemLists.push(openLists.length > 0 ? openLists[openLists.length - 1] : -1)
        continue
      }
      if (token.type === 'list_item_close') {
        openItems.pop()
        openItemLists.pop()
        continue
      }

      if (token.type === 'inline' && token.content && openItems.length > 0) {
        const match = token.content.match(/^(\[[ x]\])\s+/i)

        if (match) {
          const isChecked = match[1].toLowerCase() === '[x]'

          attrSet(tokens[openItems[openItems.length - 1]], 'class', 'task-list-item')

          const listIdx = openItemLists[openItemLists.length - 1]
          if (listIdx >= 0) {
            attrSet(tokens[listIdx], 'class', 'contains-task-list')
          }

          // Swap `[x] ` for a text placeholder until inline parsing finishes
          // so `[x]` isn't parsed as a Comark span.
          const checkboxPlaceholder = `TASK_CHECKBOX_${isChecked ? 'CHECKED' : 'UNCHECKED'} `
          token.content = token.content.replace(/^\[[ x]\]\s+/i, checkboxPlaceholder)
        }
      }
    }
  })

  // @ts-expect-error - after is not a valid method on the ruler types
  md.core.ruler.after('inline', 'task-lists-mdc-post', (state: MarkdownItState) => {
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'inline' && token.children) {
        for (let j = 0; j < token.children.length; j++) {
          const child = token.children[j]

          if (child.type === 'text' && child.content) {
            const checkedMatch = child.content.match(/^TASK_CHECKBOX_CHECKED/)
            const uncheckedMatch = child.content.match(/^TASK_CHECKBOX_UNCHECKED/)

            if (checkedMatch || uncheckedMatch) {
              const isChecked = !!checkedMatch

              const checkbox = new state.Token('mdc_inline_component', 'input', 0)
              checkbox.attrs = [
                ['class', 'task-list-item-checkbox'],
                ['type', 'checkbox'],
              ]
              if (disableCheckboxes) {
                checkbox.attrs.push([':disabled', 'true'])
              }
              if (isChecked) {
                checkbox.attrs.push([':checked', 'true'])
              }

              child.content = child.content.replace(/^TASK_CHECKBOX_(CHECKED|UNCHECKED)/, '')

              token.children.splice(j, 0, checkbox)
              j++
            }
          }
        }
      }
    }
  })
}
export default defineComarkPlugin(() => ({
  name: 'task-list',
  markdownItPlugins: [markdownItTaskList],
}))
