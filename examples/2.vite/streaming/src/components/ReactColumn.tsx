import { Suspense, useSyncExternalStore } from 'react'
import { MarkdownClient } from '@comark/react'
import { store } from '../shared/store'

export default function ReactColumn() {
  const state = useSyncExternalStore(store.subscribe, store.getState)

  return (
    <Suspense fallback={<p className="muted">Parsing…</p>}>
      <MarkdownClient
        value={state.streamed}
        streaming={state.streaming}
        plugins={state.plugins}
        effects={state.effects}
      />
    </Suspense>
  )
}
