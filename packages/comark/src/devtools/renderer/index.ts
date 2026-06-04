import type { DockClientScriptContext } from '@vitejs/devtools-kit/client'
import { DevtoolsPanel } from './panel.ts'

export default function setup(ctx: DockClientScriptContext) {
  new DevtoolsPanel(ctx)
}
