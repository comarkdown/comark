/** @jsxImportSource @opentui/react */
import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import { enableAlternateScroll } from './alternate-scroll.ts'
import { Gallery } from './app.tsx'

const renderer = await createCliRenderer({ targetFps: 30, exitOnCtrlC: true, useMouse: false })

enableAlternateScroll()

function quit() {
  renderer.destroy()
  process.exit(0)
}

createRoot(renderer).render(<Gallery onQuit={quit} />)
