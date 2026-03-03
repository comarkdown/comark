import type { ComarkElement } from 'comark/ast'
import { visit } from 'comark/ast'
import type { ComarkPlugin } from 'comark'

interface Marker {
  type: 'tip' | 'note' | 'important' | 'warning' | 'caution'
  title: string
  color: string
}

const markers: Record<string, Marker> = {
  '!TIP': {
    type: 'tip',
    title: 'Tip',
    color: '#238636',
  },
  '!NOTE': {
    type: 'note',
    title: 'Note',
    color: '#1f6feb',
  },
  '!IMPORTANT': {
    type: 'important',
    title: 'Important',
    color: '#8957e5',
  },
  '!WARNING': {
    type: 'warning',
    title: 'Warning',
    color: '#9e6a03',
  },
  '!CAUTION': {
    type: 'caution',
    title: 'Caution',
    color: '#da3633',
  },
}

export default function alert(): ComarkPlugin {
  return {
    name: 'alert',
    post(state) {
      visit(
        state.tree,
        node => Array.isArray(node) && node[0] === 'blockquote',
        (node) => {
          const element = node as ComarkElement
          if (node[2]?.[0] === 'span') {
            const content = String(node[2][2] as keyof typeof markers).toUpperCase()
            const marker = markers[content]
            if (marker) {
              if (typeof node[3] === 'string') {
                element[3] = String(element[3]).trim()
              }
              // remove span node
              element.splice(2, 1)
              element[1].as = marker.type
            }
          }
          else if (node[2]?.[0] === 'p') {
            const paragraph = node[2] as ComarkElement
            if (paragraph[2]?.[0] === 'span') {
              const content = String(paragraph[2][2] as keyof typeof markers).toUpperCase()
              const marker = markers[content]

              if (marker) {
                if (typeof paragraph[3] === 'string') {
                  paragraph[3] = String(paragraph[3]).trim()
                }
                // remove span node
                paragraph.splice(2, 1)
                // transform node
                element[1].as = marker.type
              }
            }
          }
        },
      )
    },
  }
}
