import { store, type EffectMode, type StreamState } from './shared/store'

const EFFECT_MODES: EffectMode[] = ['none', 'fade', 'typewriter']

export function mountEditor(root: HTMLElement): void {
  root.innerHTML = `
    <textarea class="source" spellcheck="false" aria-label="Markdown source"></textarea>
    <div class="controls">
      <label>Chunk <input class="chunk" type="number" min="1" max="64" /></label>
      <label>Delay ms <input class="delay" type="number" min="0" max="500" step="5" /></label>
      <label>Effect
        <select class="effect">
          ${EFFECT_MODES.map((mode) => `<option value="${mode}">${mode}</option>`).join('')}
        </select>
      </label>
      <label>Pace chars/s <input class="pace" type="number" min="1" max="1000" step="5" /></label>
      <label class="check"><input class="caret" type="checkbox" /> Caret</label>
    </div>
    <div class="actions">
      <button class="primary stream">Stream</button>
      <button class="stop">Stop</button>
      <button class="full">Show full</button>
      <button class="reset">Reset</button>
    </div>
    <p class="status"></p>
  `

  const source = root.querySelector<HTMLTextAreaElement>('.source')!
  const chunk = root.querySelector<HTMLInputElement>('.chunk')!
  const delay = root.querySelector<HTMLInputElement>('.delay')!
  const effect = root.querySelector<HTMLSelectElement>('.effect')!
  const pace = root.querySelector<HTMLInputElement>('.pace')!
  const caret = root.querySelector<HTMLInputElement>('.caret')!
  const status = root.querySelector<HTMLElement>('.status')!
  const streamBtn = root.querySelector<HTMLButtonElement>('.stream')!
  const stopBtn = root.querySelector<HTMLButtonElement>('.stop')!

  source.addEventListener('input', () => store.setSource(source.value))
  chunk.addEventListener('change', () => store.setChunkSize(Math.max(1, Number(chunk.value) || 1)))
  delay.addEventListener('change', () => store.setDelayMs(Math.max(0, Number(delay.value) || 0)))
  effect.addEventListener('change', () => store.setEffectMode(effect.value as EffectMode))
  pace.addEventListener('change', () => store.setPaceSpeed(Math.max(1, Number(pace.value) || 1)))
  caret.addEventListener('change', () => store.setShowCaret(caret.checked))
  streamBtn.addEventListener('click', () => store.start())
  stopBtn.addEventListener('click', () => store.stop())
  root.querySelector('.full')!.addEventListener('click', () => store.showFull())
  root.querySelector('.reset')!.addEventListener('click', () => store.reset())

  function syncNumber(input: HTMLInputElement, value: number): void {
    if (document.activeElement !== input) input.value = String(value)
  }

  function render(state: StreamState): void {
    if (source.value !== state.source) source.value = state.source
    syncNumber(chunk, state.chunkSize)
    syncNumber(delay, state.delayMs)
    effect.value = state.effectMode
    syncNumber(pace, state.paceSpeed)
    caret.checked = state.showCaret
    source.disabled = state.streaming
    streamBtn.disabled = state.streaming
    stopBtn.disabled = !state.streaming
    status.textContent = state.streaming
      ? `streaming ${state.streamed.length} / ${state.source.length} chars`
      : `${state.streamed.length} / ${state.source.length} chars`
  }

  render(store.getState())
  store.subscribe(render)
}
