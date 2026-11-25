import shiki from 'comark/plugins/shiki'
import type { ComarkPlugin } from 'comark'
import { caret, fade, pace, typewriter, type StreamEffect } from 'comark/effects'
import { SAMPLE_MARKDOWN } from './sample'

export type EffectName = 'pace' | 'fade' | 'typewriter' | 'caret'

export type EffectToggles = Record<EffectName, boolean>

export interface StreamState {
  source: string
  streamed: string
  streaming: boolean
  chunkSize: number
  delayMs: number
  enabledEffects: EffectToggles
  paceSpeed: number
  plugins: readonly ComarkPlugin[]
  effects: readonly StreamEffect[]
}

type Listener = (state: StreamState) => void

const DEFAULT_PACE_SPEED = 45
const DEFAULT_EFFECTS: EffectToggles = { pace: false, fade: true, typewriter: false, caret: true }

// Created once and shared by every renderer. Each renderer's `createStreamRenderer` keeps its own
// per-effect state, so sharing these instances does not mix the columns together.
const plugins: readonly ComarkPlugin[] = [shiki()]

// Order matters: `pace` first so later effects only see released text, `caret` last.
function buildEffects(enabled: EffectToggles, speed: number): StreamEffect[] {
  const effects: StreamEffect[] = []
  if (enabled.pace) effects.push(pace({ speed }))
  if (enabled.fade) effects.push(fade({ duration: 300, delay: 30 }))
  if (enabled.typewriter) effects.push(typewriter({ speed }))
  if (enabled.caret) effects.push(caret())
  return effects
}

export interface StreamStore {
  getState: () => StreamState
  subscribe: (listener: (state: StreamState) => void) => () => void
  setSource: (source: string) => void
  setChunkSize: (chunkSize: number) => void
  setDelayMs: (delayMs: number) => void
  setEffectEnabled: (effect: EffectName, enabled: boolean) => void
  setPaceSpeed: (paceSpeed: number) => void
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
    enabledEffects: DEFAULT_EFFECTS,
    paceSpeed: DEFAULT_PACE_SPEED,
    plugins,
    effects: buildEffects(DEFAULT_EFFECTS, DEFAULT_PACE_SPEED),
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

    setEffectEnabled(effect: EffectName, enabled: boolean): void {
      const enabledEffects = { ...state.enabledEffects, [effect]: enabled }
      update({ enabledEffects, effects: buildEffects(enabledEffects, state.paceSpeed) })
    },

    setPaceSpeed(paceSpeed: number): void {
      update({ paceSpeed, effects: buildEffects(state.enabledEffects, paceSpeed) })
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
