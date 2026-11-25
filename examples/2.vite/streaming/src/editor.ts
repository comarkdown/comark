import { store, type EffectName, type StreamState } from './shared/store'

const EFFECTS: EffectName[] = ['pace', 'fade', 'typewriter', 'caret']

export function mountEditor(root: HTMLElement): void {
  root.innerHTML = `
    <textarea class="source" spellcheck="false" aria-label="Markdown source"></textarea>
    <div class="controls">
      <label>Chunk <input class="chunk" type="number" min="1" max="64" /></label>
      <label>Delay ms <input class="delay" type="number" min="0" max="500" step="5" /></label>
      <label>Speed chars/s <input class="pace" type="number" min="1" max="1000" step="5" /></label>
    </div>
    <fieldset class="effects">
      <legend>Effects</legend>
      ${EFFECTS.map(
        (name) => `<label class="check"><input class="effect" type="checkbox" value="${name}" /> ${name}</label>`
      ).join('')}
    </fieldset>
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
  const effects = Array.from(root.querySelectorAll<HTMLInputElement>('.effect'))
  const pace = root.querySelector<HTMLInputElement>('.pace')!
  const status = root.querySelector<HTMLElement>('.status')!
  const streamBtn = root.querySelector<HTMLButtonElement>('.stream')!
  const stopBtn = root.querySelector<HTMLButtonElement>('.stop')!

  source.addEventListener('input', () => store.setSource(source.value))
  chunk.addEventListener('change', () => store.setChunkSize(Math.max(1, Number(chunk.value) || 1)))
  delay.addEventListener('change', () => store.setDelayMs(Math.max(0, Number(delay.value) || 0)))
  for (const checkbox of effects) {
    checkbox.addEventListener('change', () => store.setEffectEnabled(checkbox.value as EffectName, checkbox.checked))
  }
  pace.addEventListener('change', () => store.setPaceSpeed(Math.max(1, Number(pace.value) || 1)))
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
    for (const checkbox of effects) checkbox.checked = state.enabledEffects[checkbox.value as EffectName]
    syncNumber(pace, state.paceSpeed)
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
