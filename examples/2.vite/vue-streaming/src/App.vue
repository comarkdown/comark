<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Markdown } from '@comark/vue'
import { SAMPLE_MARKDOWN } from './sample'
import { emptyStats, trackFrame, visibleText, type MisrenderStats } from './misrender'

const source = ref(SAMPLE_MARKDOWN.trimEnd())
const streamed = ref('')
const isStreaming = ref(false)
const streamingMode = ref(true)
const showCaret = ref(true)
const charsPerTick = ref(2)
const delayMs = ref(40)
const stats = ref<MisrenderStats>(emptyStats())
const prevVisible = ref('')
const streamStartedAt = ref(0)
const previewEl = ref<HTMLElement | null>(null)
const selectedEvent = ref<number | null>(null)
const tracking = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null
let sampleRaf: number | null = null
let observer: MutationObserver | null = null
let streamIndex = 0

const progress = computed(() => {
  if (!source.value.length) return 0
  return Math.min(100, Math.round((streamed.value.length / source.value.length) * 100))
})

const recentEvents = computed(() => {
  // Oldest first — keep the most recent 40, then chronological order
  const events = stats.value.events
  const slice = events.length > 40 ? events.slice(-40) : events
  return slice.map((event) => {
    const { fromHtml, toHtml } = eventDiffHtml(event.from, event.to)
    return {
      ...event,
      fromHtml,
      toHtml,
      removedLabel: formatRemoved(event.removed),
    }
  })
})

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function clearSampleRaf() {
  if (sampleRaf !== null) {
    cancelAnimationFrame(sampleRaf)
    sampleRaf = null
  }
}

function resetStats() {
  stats.value = emptyStats()
  prevVisible.value = ''
  selectedEvent.value = null
}

/** Sample visible text after the next paint (coalesced). */
function scheduleSample() {
  if (!tracking.value) return
  if (sampleRaf !== null) return
  sampleRaf = requestAnimationFrame(() => {
    sampleRaf = null
    // Second rAF: wait until layout after async Markdown parse commits
    sampleRaf = requestAnimationFrame(() => {
      sampleRaf = null
      if (!tracking.value) return
      const next = visibleText(previewEl.value)
      if (next === prevVisible.value && stats.value.frames > 0) return
      prevVisible.value = trackFrame(stats.value, prevVisible.value, next, streamStartedAt.value)
    })
  })
}

function attachObserver() {
  detachObserver()
  if (!previewEl.value) return
  observer = new MutationObserver(() => scheduleSample())
  observer.observe(previewEl.value, {
    childList: true,
    subtree: true,
    characterData: true,
  })
}

function detachObserver() {
  observer?.disconnect()
  observer = null
  clearSampleRaf()
}

function stopStream(finalize = true) {
  clearTimer()
  isStreaming.value = false
  if (finalize) {
    streamed.value = source.value
    // Keep tracking briefly so the final paint is measured
    scheduleSample()
    setTimeout(() => {
      tracking.value = false
    }, 120)
  } else {
    tracking.value = false
  }
}

function tick() {
  if (!isStreaming.value) return

  if (streamIndex >= source.value.length) {
    isStreaming.value = false
    streamed.value = source.value
    scheduleSample()
    setTimeout(() => {
      tracking.value = false
    }, 120)
    return
  }

  const step = Math.max(1, charsPerTick.value)
  streamIndex = Math.min(source.value.length, streamIndex + step)
  streamed.value = source.value.slice(0, streamIndex)

  timer = setTimeout(tick, Math.max(0, delayMs.value))
}

function startStream() {
  clearTimer()
  resetStats()
  streamIndex = 0
  streamed.value = ''
  isStreaming.value = true
  tracking.value = true
  streamStartedAt.value = performance.now()
  attachObserver()
  scheduleSample()
  timer = setTimeout(tick, Math.max(0, delayMs.value))
}

function resetAll() {
  stopStream(false)
  streamed.value = ''
  resetStats()
}

function fillFull() {
  stopStream(false)
  tracking.value = true
  streamStartedAt.value = performance.now()
  attachObserver()
  streamed.value = source.value
  scheduleSample()
  setTimeout(() => {
    tracking.value = false
  }, 120)
}

watch(source, () => {
  if (!isStreaming.value) {
    streamed.value = ''
    resetStats()
  }
})

onMounted(() => {
  attachObserver()
})

onBeforeUnmount(() => {
  clearTimer()
  detachObserver()
})

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escapePreview(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
}

/** Keep the last N lines of visible text for compact log display. */
function lastLines(text: string, count = 3): string {
  if (!text) return ''
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  if (lines.length <= count) return text
  return lines.slice(-count).join('\n')
}

function formatRemoved(removed: string): string {
  return [...removed]
    .map((ch) => {
      if (ch === ' ') return '␠'
      if (ch === '\n') return '↵'
      if (ch === '\t') return '⇥'
      return ch
    })
    .join('')
}

type DiffSeg = { text: string; kind: 'same' | 'del' | 'add' }

/**
 * Character-level LCS diff. Marks removals on `from` and additions on `to`.
 * Used to highlight what flickered in the mis-render log.
 */
function diffChars(from: string, to: string): { fromSegs: DiffSeg[]; toSegs: DiffSeg[] } {
  const m = from.length
  const n = to.length
  const dp: Uint16Array[] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (from.charCodeAt(i - 1) === to.charCodeAt(j - 1)) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const fromSegsRev: DiffSeg[] = []
  const toSegsRev: DiffSeg[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && from.charCodeAt(i - 1) === to.charCodeAt(j - 1)) {
      fromSegsRev.push({ text: from[i - 1]!, kind: 'same' })
      toSegsRev.push({ text: to[j - 1]!, kind: 'same' })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      toSegsRev.push({ text: to[j - 1]!, kind: 'add' })
      j--
    } else {
      fromSegsRev.push({ text: from[i - 1]!, kind: 'del' })
      i--
    }
  }

  return {
    fromSegs: mergeSegs(fromSegsRev.reverse()),
    toSegs: mergeSegs(toSegsRev.reverse()),
  }
}

function mergeSegs(segs: DiffSeg[]): DiffSeg[] {
  const out: DiffSeg[] = []
  for (const seg of segs) {
    const last = out[out.length - 1]
    if (last && last.kind === seg.kind) last.text += seg.text
    else out.push({ ...seg })
  }
  return out
}

function segsToHtml(segs: DiffSeg[]): string {
  return segs
    .map((seg) => {
      // Only mark newlines / multi-space runs (typically from code); single
      // collapsible spaces render as a normal space so the log stays readable.
      const body = escapeHtml(seg.text)
        .replace(/\n/g, '<span class="nl">↵</span>\n')
        .replace(/ {2,}/g, (run) =>
          run
            .split('')
            .map(() => '<span class="sp">·</span>')
            .join('')
        )
      if (seg.kind === 'same') return body
      return `<mark class="hl-${seg.kind}">${body}</mark>`
    })
    .join('')
}

function eventDiffHtml(from: string, to: string): { fromHtml: string; toHtml: string } {
  // Diff full strings for correct alignment, then keep only the last 3 lines of each side.
  const { fromSegs, toSegs } = diffChars(from, to)
  const fromHtml = segsToHtml(trimSegsToLastLines(fromSegs, 3))
  const toHtml = segsToHtml(trimSegsToLastLines(toSegs, 3))
  return { fromHtml, toHtml }
}

function trimSegsToLastLines(segs: DiffSeg[], count: number): DiffSeg[] {
  const full = segs.map((s) => s.text).join('')
  const lines = full.replace(/\r\n/g, '\n').split('\n')
  if (lines.length <= count) return segs

  // Find char offset where the last `count` lines start
  let cut = 0
  const drop = lines.length - count
  for (let i = 0; i < drop; i++) cut += lines[i]!.length + 1 // + newline

  let seen = 0
  const out: DiffSeg[] = []
  for (const seg of segs) {
    const start = seen
    const end = seen + seg.text.length
    seen = end
    if (end <= cut) continue
    if (start >= cut) {
      out.push(seg)
      continue
    }
    // Segment straddles the cut
    out.push({ text: seg.text.slice(cut - start), kind: seg.kind })
  }
  return mergeSegs(out)
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div>
        <h1>Streaming mis-render tracker</h1>
        <p class="sub">
          Paste markdown, stream it character-by-character, and count every visible character that later disappears (a
          mis-render flash).
        </p>
      </div>
      <div class="stats-strip">
        <div class="stat">
          <span class="stat-label">Frames</span>
          <span class="stat-value">{{ stats.frames }}</span>
        </div>
        <div class="stat danger">
          <span class="stat-label">Mis-render chars</span>
          <span class="stat-value">{{ stats.misrenderChars }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Events</span>
          <span class="stat-value">{{ stats.misrenderEvents }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Progress</span>
          <span class="stat-value">{{ progress }}%</span>
        </div>
      </div>
    </header>

    <section class="controls">
      <label class="field">
        <span>Chars / tick</span>
        <input
          v-model.number="charsPerTick"
          type="number"
          min="1"
          max="64"
        />
      </label>
      <label class="field">
        <span>Delay (ms)</span>
        <input
          v-model.number="delayMs"
          type="number"
          min="0"
          max="500"
          step="5"
        />
      </label>
      <label class="check">
        <input
          v-model="streamingMode"
          type="checkbox"
        />
        <span><code>streaming</code> mode (auto-close + drop trailing openers)</span>
      </label>
      <label class="check">
        <input
          v-model="showCaret"
          type="checkbox"
        />
        <span>Caret</span>
      </label>

      <div class="actions">
        <button
          class="primary"
          :disabled="isStreaming || !source"
          @click="startStream"
        >
          Stream
        </button>
        <button
          :disabled="!isStreaming"
          @click="stopStream(true)"
        >
          Stop
        </button>
        <button @click="fillFull">Show full</button>
        <button @click="resetAll">Reset</button>
      </div>
    </section>

    <div class="grid">
      <section class="panel panel-input">
        <div class="panel-head">
          <h2>Markdown input</h2>
          <button
            class="ghost"
            type="button"
            @click="source = SAMPLE_MARKDOWN.trimEnd()"
          >
            Restore sample
          </button>
        </div>
        <textarea
          v-model="source"
          class="editor"
          spellcheck="false"
          :disabled="isStreaming"
          placeholder="Paste or type markdown…"
        />
        <p class="hint">
          Example: streaming <code>Hello *</code> then <code>Hello *da</code> can flash a literal <code>*</code> before
          it becomes <code>&lt;strong&gt;da&lt;/strong&gt;</code>
          — that asterisk counts as a mis-render.
        </p>
      </section>

      <section class="panel panel-preview">
        <div class="panel-head">
          <h2>Live render</h2>
          <span
            class="badge"
            :class="isStreaming ? 'on' : 'off'"
          >
            {{ isStreaming ? 'streaming' : streamingMode ? 'idle (stream mode on)' : 'idle' }}
          </span>
        </div>
        <div
          ref="previewEl"
          class="preview prose"
        >
          <Suspense>
            <Markdown
              :value="streamed"
              :streaming="isStreaming && streamingMode"
              :caret="showCaret && isStreaming"
            />
            <template #fallback>
              <p class="muted">Parsing…</p>
            </template>
          </Suspense>
        </div>
        <div class="raw">
          <span class="raw-label">Visible text snapshot (last 3 lines)</span>
          <code>{{ escapePreview(lastLines(prevVisible)) || '—' }}</code>
        </div>
      </section>

      <section class="panel log">
        <div class="panel-head">
          <h2>Mis-render log</h2>
          <span class="muted">last 3 lines · changes highlighted · oldest first</span>
        </div>
        <div
          v-if="!stats.events.length"
          class="empty"
        >
          No mis-renders yet. Hit <strong>Stream</strong> to measure flicker.
        </div>
        <ul
          v-else
          class="events"
        >
          <li
            v-for="event in recentEvents"
            :key="event.frame"
            :class="{ active: selectedEvent === event.frame }"
            @click="selectedEvent = event.frame"
          >
            <div class="event-top">
              <span class="frame">frame {{ event.frame }}</span>
              <span class="time">+{{ event.at.toFixed(0) }}ms</span>
              <span class="removed">−{{ event.removedLabel }}</span>
            </div>
            <div class="event-diff">
              <div>
                <span class="tag">from</span>
                <code
                  class="diff-code"
                  v-html="event.fromHtml"
                />
              </div>
              <div>
                <span class="tag">to</span>
                <code
                  class="diff-code"
                  v-html="event.toHtml"
                />
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style>
:root {
  color-scheme: light dark;
  --bg: #0b0d10;
  --panel: #12161c;
  --panel-2: #181e27;
  --border: #2a3340;
  --text: #e7eef7;
  --muted: #8b98a8;
  --accent: #3b82f6;
  --danger: #f43f5e;
  --ok: #22c55e;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--sans);
  background: radial-gradient(1200px 600px at 10% -10%, #152033 0%, var(--bg) 55%);
  color: var(--text);
  min-height: 100vh;
}

.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
}

h1 {
  margin: 0 0 0.35rem;
  font-size: 1.45rem;
  letter-spacing: -0.02em;
}

.sub {
  margin: 0;
  color: var(--muted);
  max-width: 52ch;
  line-height: 1.5;
  font-size: 0.95rem;
}

.stats-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.stat {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  min-width: 7.5rem;
}

.stat.danger .stat-value {
  color: var(--danger);
}

.stat-label {
  display: block;
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.1rem;
  align-items: center;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.85rem 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.78rem;
  color: var(--muted);
}

.field input {
  width: 5.5rem;
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  padding: 0.4rem 0.5rem;
  font: inherit;
}

.check {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  font-size: 0.88rem;
  color: var(--text);
}

.check code {
  font-family: var(--mono);
  font-size: 0.84em;
  background: var(--panel-2);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-left: auto;
}

button {
  font: inherit;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

button.primary {
  background: var(--accent);
  border-color: transparent;
  color: white;
  font-weight: 600;
}

button.ghost {
  background: transparent;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto;
  gap: 1rem;
  align-items: stretch;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.9rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.panel-input,
.panel-preview {
  height: 420px;
  min-height: 420px;
  max-height: 420px;
  overflow: hidden;
}

.panel.log {
  grid-column: 1 / -1;
  min-height: 0;
  max-height: 360px;
  overflow: hidden;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.panel-head h2 {
  margin: 0;
  font-size: 0.95rem;
}

.editor {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  resize: none;
  width: 100%;
  background: #0a0c10;
  color: #d7e2ef;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.85rem;
  font-family: var(--mono);
  font-size: 0.86rem;
  line-height: 1.5;
  overflow: auto;
}

.hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.45;
  flex-shrink: 0;
}

.hint code {
  font-family: var(--mono);
  font-size: 0.9em;
  background: var(--panel-2);
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
}

.preview {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  background: #0a0c10;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  overflow: auto;
  line-height: 1.6;
}

.prose h1 {
  font-size: 1.45rem;
  margin: 0 0 0.7rem;
}

.prose h2 {
  font-size: 1.15rem;
  margin: 1.1rem 0 0.5rem;
}

.prose p {
  margin: 0.55rem 0;
}

.prose pre {
  background: #151a22;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  overflow: auto;
  font-family: var(--mono);
  font-size: 0.85rem;
}

.prose code {
  font-family: var(--mono);
  font-size: 0.88em;
}

.prose blockquote {
  margin: 0.7rem 0;
  padding-left: 0.85rem;
  border-left: 3px solid var(--accent);
  color: #c5d0de;
}

.raw {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
  min-height: 0;
}

.raw-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.raw code {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: #b7c4d4;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  background: var(--panel-2);
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  max-height: 4.8em;
  overflow: auto;
}

.badge {
  font-size: 0.75rem;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--border);
  color: var(--muted);
}

.badge.on {
  color: #bbf7d0;
  border-color: color-mix(in oklab, var(--ok) 50%, var(--border));
  background: color-mix(in oklab, var(--ok) 18%, transparent);
}

.badge.off {
  background: var(--panel-2);
}

.muted {
  color: var(--muted);
  font-size: 0.85rem;
}

.empty {
  color: var(--muted);
  padding: 1.2rem 0.4rem;
}

.events {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.events li {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  cursor: pointer;
  min-width: 0;
}

.events li.active {
  border-color: color-mix(in oklab, var(--danger) 55%, var(--border));
}

.event-top {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  margin-bottom: 0.45rem;
  font-size: 0.82rem;
}

.frame {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.time {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.removed {
  margin-left: auto;
  font-family: var(--mono);
  color: var(--danger);
  font-weight: 700;
  background: color-mix(in oklab, var(--danger) 14%, transparent);
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
}

.event-diff {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.event-diff > div {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: 0.45rem;
  align-items: start;
  min-width: 0;
}

.tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  padding-top: 0.2rem;
}

.event-diff code,
.diff-code {
  display: block;
  font-family: var(--mono);
  font-size: 0.78rem;
  line-height: 1.45;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  color: #d5e0ec;
  min-width: 0;
  max-height: 5.2em;
  overflow: auto;
  background: #0a0c10;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
}

.diff-code mark.hl-del {
  background: color-mix(in oklab, var(--danger) 42%, transparent);
  color: #fecdd3;
  border-radius: 3px;
  padding: 0 0.1em;
  box-shadow: inset 0 -1px 0 color-mix(in oklab, var(--danger) 55%, transparent);
}

.diff-code mark.hl-add {
  background: color-mix(in oklab, var(--ok) 36%, transparent);
  color: #bbf7d0;
  border-radius: 3px;
  padding: 0 0.1em;
  box-shadow: inset 0 -1px 0 color-mix(in oklab, var(--ok) 50%, transparent);
}

.diff-code .nl,
.diff-code .sp {
  opacity: 0.45;
  font-size: 0.85em;
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel-input,
  .panel-preview {
    height: 360px;
    min-height: 360px;
    max-height: 360px;
  }

  .actions {
    margin-left: 0;
    width: 100%;
  }
}
</style>
