import shiki from 'comark/plugins/shiki'
import type { ComarkPlugin } from 'comark'
import { caret, fade, typewriter, type StreamEffect } from 'comark/stream'
import { SAMPLE_MARKDOWN } from './sample'

export type EffectMode = 'none' | 'fade' | 'typewriter'

export interface StreamState {
  source: string
  streamed: string
  streaming: boolean
  chunkSize: number
  delayMs: number
  effectMode: EffectMode
  paceSpeed: number
  showCaret: boolean
  plugins: readonly ComarkPlugin[]
  effects: readonly StreamEffect[]
}

type Listener = (state: StreamState) => void

const DEFAULT_PACE_SPEED = 45

// Created once and shared by every renderer. Each renderer's `createStreamRenderer` keeps its own
// per-effect state, so sharing these instances does not mix the columns together.
const plugins: readonly ComarkPlugin[] = [shiki()]

function buildEffects(mode: EffectMode, paceSpeed: number, showCaret: boolean): StreamEffect[] {
  const effects: StreamEffect[] = []
  if (mode === 'fade') effects.push(fade({ duration: 300, delay: 30, speed: paceSpeed }))
  if (mode === 'typewriter') effects.push(typewriter({ speed: paceSpeed }))
  if (showCaret) effects.push(caret())
  return effects
}

export interface StreamStore {
  getState: () => StreamState
  subscribe: (listener: (state: StreamState) => void) => () => void
  setSource: (source: string) => void
  setChunkSize: (chunkSize: number) => void
  setDelayMs: (delayMs: number) => void
  setEffectMode: (effectMode: EffectMode) => void
  setPaceSpeed: (paceSpeed: number) => void
  setShowCaret: (showCaret: boolean) => void
  start: () => void
  stop: () => void
  showFull: () => void
  reset: () => void
}

export function createStreamStore(initialSource: string): StreamStore {
  const listeners = new Set<Listener>()
  let timer: ReturnType<typeof setTimeout> | null = null
  let cursor = 0

  let state: StreamState = {
    source: initialSource,
    streamed: initialSource,
    streaming: false,
    chunkSize: 40,
    delayMs: 40,
    effectMode: 'fade',
    paceSpeed: DEFAULT_PACE_SPEED,
    showCaret: true,
    plugins,
    effects: buildEffects('fade', DEFAULT_PACE_SPEED, true),
  }

  function update(patch: Partial<StreamState>): void {
    state = { ...state, ...patch }
    for (const listener of listeners) listener(state)
  }

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function tick(): void {
    timer = null
    if (!state.streaming) return
    if (cursor >= state.source.length) {
      update({ streaming: false, streamed: state.source })
      return
    }
    cursor = Math.min(state.source.length, cursor + Math.max(1, state.chunkSize))
    update({ streamed: state.source.slice(0, cursor) })
    timer = setTimeout(tick, Math.max(0, state.delayMs))
  }

  return {
    getState: (): StreamState => state,

    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    setSource(source: string): void {
      if (state.streaming) return
      update({ source, streamed: source })
    },

    setChunkSize(chunkSize: number): void {
      update({ chunkSize })
    },

    setDelayMs(delayMs: number): void {
      update({ delayMs })
    },

    setEffectMode(effectMode: EffectMode): void {
      update({ effectMode, effects: buildEffects(effectMode, state.paceSpeed, state.showCaret) })
    },

    setPaceSpeed(paceSpeed: number): void {
      update({ paceSpeed, effects: buildEffects(state.effectMode, paceSpeed, state.showCaret) })
    },

    setShowCaret(showCaret: boolean): void {
      update({ showCaret, effects: buildEffects(state.effectMode, state.paceSpeed, showCaret) })
    },

    start(): void {
      clearTimer()
      cursor = 0
      update({ streaming: true, streamed: '' })
      timer = setTimeout(tick, 0)
    },

    stop(): void {
      clearTimer()
      update({ streaming: false })
    },

    showFull(): void {
      clearTimer()
      cursor = state.source.length
      update({ streaming: false, streamed: state.source })
    },

    reset(): void {
      clearTimer()
      cursor = 0
      update({ streaming: false, streamed: '' })
    },
  }
}

export const store = createStreamStore(SAMPLE_MARKDOWN.trimEnd())
