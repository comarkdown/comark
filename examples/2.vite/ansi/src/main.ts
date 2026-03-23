import '@xterm/xterm/css/xterm.css'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { createParse } from 'comark'
import math from 'comark/plugins/math'
import highlight from 'comark/plugins/highlight'
import { renderANSI } from '@comark/ansi'

const plugins = [math(), highlight()]
const parse = createParse({ plugins })

const SAMPLE = `---
title: Comark ANSI Demo
---

# Comark ANSI Renderer

Render **Comark** markdown as _styled_ terminal output.

## Text Formatting

You can use **bold**, _italic_, ~~strikethrough~~, and \`inline code\`.

Links look like this: [xtermjs.org](https://xtermjs.org)

## Code Block

\`\`\`typescript [main.ts]
import { parse } from 'comark'
import { renderANSI } from '@comark/ansi'

const tree = await parse('# Hello World')
console.log(renderANSI(tree))
\`\`\`

## Lists

Unordered:

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered:

1. Step one
2. Step two
3. Step three

## Blockquote

> The terminal is not just a tool,
> it is a way of life.

## GitHub Alerts

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## Component Slots

::alert
#title
Hello from the title slot

#default
This is the **default** slot with _markdown_ content.

#footer
Footer slot content here.
::

## Math

Inline: The energy equation $E = mc^2$ is fundamental to physics.

Block display math:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Table

| Feature     | Status  |
| ----------- | ------- |
| Headings    | ✅      |
| Bold/Italic | ✅      |
| Code blocks | ✅      |
| Tables      | ✅      |
| Lists       | ✅      |

---

_Edit the markdown on the left to see live updates._
`

// --- Terminal setup ---

const term = new Terminal({
  convertEol: true,
  cursorBlink: false,
  cursorStyle: 'underline',
  disableStdin: true,
  fontFamily: '\'JetBrains Mono\', \'Fira Code\', \'Cascadia Code\', ui-monospace, monospace',
  fontSize: 13,
  lineHeight: 1.4,
  theme: {
    background: '#0d0d0d',
    foreground: '#e0e0e0',
    black: '#1a1a1a',
    brightBlack: '#555',
    red: '#f38ba8',
    brightRed: '#f38ba8',
    green: '#a6e3a1',
    brightGreen: '#a6e3a1',
    yellow: '#f9e2af',
    brightYellow: '#f9e2af',
    blue: '#89b4fa',
    brightBlue: '#89b4fa',
    magenta: '#cba6f7',
    brightMagenta: '#cba6f7',
    cyan: '#89dceb',
    brightCyan: '#89dceb',
    white: '#cdd6f4',
    brightWhite: '#ffffff',
    cursor: '#f5e0dc',
    selectionBackground: '#45475a',
  },
  scrollback: 5000,
})

const fitAddon = new FitAddon()
term.loadAddon(fitAddon)
term.open(document.getElementById('terminal')!)
fitAddon.fit()

window.addEventListener('resize', () => fitAddon.fit())

// --- Render logic ---

async function render(markdown: string) {
  const tree = await parse(markdown)
  const ansi = await renderANSI(tree, { width: term.cols })

  term.reset()
  term.write(ansi)
}

// --- Editor setup ---

const input = document.getElementById('input') as HTMLTextAreaElement
input.value = SAMPLE
render(SAMPLE)

let debounceTimer: ReturnType<typeof setTimeout>
input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => render(input.value), 150)
})
