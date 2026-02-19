/**
 * Custom task list plugin for markdown-it that works with markdown-it-mdc
 *
 * This plugin runs before inline parsing to prevent Comark from interpreting
 * task list markers [X] and [ ] as Comark inline span syntax.
 */

import type { ComarkPlugin } from '../types'

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
  }
  else {
    token.attrs![index] = attr
  }
}

function findParentListItem(tokens: MarkdownItToken[], index: number): number {
  // Look backwards for list_item_open
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].type === 'list_item_open') {
      return i
    }
    if (tokens[i].type === 'list_item_close') {
      // We've gone past the current list item
      return -1
    }
  }
  return -1
}

function findParentList(tokens: MarkdownItToken[], listItemIndex: number): number {
  const targetLevel = tokens[listItemIndex].level - 1

  // Look backwards for the list (ul/ol) that contains this list item
  for (let i = listItemIndex - 1; i >= 0; i--) {
    if (tokens[i].level === targetLevel
      && (tokens[i].type === 'bullet_list_open' || tokens[i].type === 'ordered_list_open')) {
      return i
    }
  }
  return -1
}

export function markdownItTaskList(md: MarkdownIt, options?: TaskListOptions) {
  const disableCheckboxes = !(options?.enabled ?? false)

  // Run BEFORE inline parsing to prevent Comark from processing task list markers
  md.core.ruler.before('inline', 'task-lists-mdc', (state: MarkdownItState) => {
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      // Look for list items that might contain task lists
      if (token.type === 'inline' && token.content) {
        const parentIdx = findParentListItem(tokens, i)

        if (parentIdx >= 0) {
          // Check if content starts with task list marker
          const match = token.content.match(/^(\[[ x]\])\s+/i)

          if (match) {
            const isChecked = match[1].toLowerCase() === '[x]'

            // Mark the list item with task-list-item class
            attrSet(tokens[parentIdx], 'class', 'task-list-item')

            // Mark the parent list with contains-task-list class
            const listIdx = findParentList(tokens, parentIdx)
            if (listIdx >= 0) {
              attrSet(tokens[listIdx], 'class', 'contains-task-list')
            }

            // Replace the task marker with a placeholder that won't be processed by Comark
            // We use a special format that we can detect later
            // Keep one space after the placeholder to match expected output
            const checkboxPlaceholder = `{{TASK_CHECKBOX_${isChecked ? 'CHECKED' : 'UNCHECKED'}}} `
            token.content = token.content.replace(/^\[[ x]\]\s+/i, checkboxPlaceholder)
          }
        }
      }
    }
  })

  // Run AFTER inline parsing to replace placeholders with actual checkbox HTML
  // @ts-expect-error - after is not a valid method on the ruler types
  md.core.ruler.after('inline', 'task-lists-mdc-post', (state: MarkdownItState) => {
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'inline' && token.children) {
        for (let j = 0; j < token.children.length; j++) {
          const child = token.children[j]

          if (child.type === 'text' && child.content) {
            // Check for our checkbox placeholder
            const checkedMatch = child.content.match(/^\{\{TASK_CHECKBOX_CHECKED\}\}/)
            const uncheckedMatch = child.content.match(/^\{\{TASK_CHECKBOX_UNCHECKED\}\}/)

            if (checkedMatch || uncheckedMatch) {
              const isChecked = !!checkedMatch

              // Create checkbox token
              const checkbox = new state.Token('mdc_inline_component', 'input', 0)
              checkbox.attrs = [['class', 'task-list-item-checkbox'], ['type', 'checkbox']]
              if (disableCheckboxes) {
                checkbox.attrs.push([':disabled', 'true'])
              }
              if (isChecked) {
                checkbox.attrs.push([':checked', 'true'])
              }

              // Remove placeholder from text
              child.content = child.content.replace(/^\{\{TASK_CHECKBOX_(CHECKED|UNCHECKED)\}\}/, '')

              // Insert checkbox before the text
              token.children.splice(j, 0, checkbox)
              j++ // Skip the newly inserted checkbox
            }
          }
        }
      }
    }
  })
}

export default function comarkTaskList(): ComarkPlugin {
  return {
    markdownItPlugins: [markdownItTaskList],
  }
}
