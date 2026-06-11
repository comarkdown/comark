'use client'

import { useEffect, useRef, useState } from 'react'
import { Streamdown, type CaretShape } from '@comark/react/streamdown'
import 'katex/dist/katex.min.css'
import Alert from '@/components/Alert'
import { SAMPLE } from './fixture'

const TICK_MS = 30

export default function StreamingDemo() {
  const [cursor, setCursor] = useState(SAMPLE.length)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(4) // characters per tick
  const [autoClose, setAutoClose] = useState(true)
  const [caret, setCaret] = useState<CaretShape>('block')
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setCursor((c) => {
        const next = c + speed
        if (next >= SAMPLE.length) {
          setPlaying(false)
          return SAMPLE.length
        }
        return next
      })
    }, TICK_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, speed])

  const restart = () => {
    setCursor(0)
    setPlaying(true)
  }

  const done = cursor >= SAMPLE.length
  const progress = Math.round((cursor / SAMPLE.length) * 100)

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Streaming demo</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6">
        A drop-in <code>&lt;Streamdown&gt;</code> backed by Comark, fed one chunk at a time.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
        <button
          type="button"
          onClick={() => (done ? restart() : setPlaying((p) => !p))}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          {done ? 'Restart' : playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={restart}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Reset
        </button>

        <label className="flex items-center gap-2 text-sm">
          Speed
          <input
            type="range"
            min={1}
            max={20}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          Caret
          <select
            value={caret}
            onChange={(e) => setCaret(e.target.value as CaretShape)}
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1"
          >
            <option value="block">Block</option>
            <option value="circle">Circle</option>
            <option value="none">None</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoClose}
            onChange={(e) => setAutoClose(e.target.checked)}
          />
          Auto-close incomplete markdown
        </label>

        <span className="ml-auto text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{progress}%</span>
      </div>
      <p className="mb-6 text-xs text-neutral-500 dark:text-neutral-400">
        Toggle auto-close off and scrub mid-stream to see raw partial tokens (<code>**bold</code>, open fences) instead
        of clean output.
      </p>

      <div className="prose rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
        <Streamdown
          mode="streaming"
          parseIncompleteMarkdown={autoClose}
          caret={playing ? caret : 'none'}
          components={{ alert: Alert }}
        >
          {SAMPLE.slice(0, cursor)}
        </Streamdown>
      </div>
    </>
  )
}
