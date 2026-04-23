import { defineComarkPlugin } from '../utils/helpers.ts'
import { visit } from '../utils/index.ts'

export default defineComarkPlugin(() => ({
  name: 'breaks',
  post(state) {
    visit(
      state.tree,
      (node) => Array.isArray(node) && node.length > 2,
      (node) => {
        const parent = node as any[]
        const newParent = [parent[0], parent[1]]
        let hasModified = false

        for (let i = 2; i < parent.length; i++) {
          const child = parent[i]

          if (typeof child === 'string' && child.includes('\n')) {
            hasModified = true
            const lines = child.split('\n')

            lines.forEach((line, index) => {
              if (line.length > 0) {
                newParent.push(line)
              }
              if (index < lines.length - 1) {
                newParent.push(['br', {}])
              }
            })
          } else {
            newParent.push(child)
          }
        }

        if (hasModified) {
          parent.length = 0
          parent.push(...newParent)
        }
      }
    )
  },
}))
