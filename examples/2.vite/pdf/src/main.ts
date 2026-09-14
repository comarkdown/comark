import { createPdfRenderer } from '@comark/pdf'
import { mount } from '@comark/pdf/preview'
import { examples, type DemoExample } from './examples/index.ts'

const preview = document.getElementById('preview') as HTMLDivElement
const pageCount = document.getElementById('page-count') as HTMLSpanElement
const input = document.getElementById('input') as HTMLTextAreaElement
const exampleTabs = document.getElementById('example-tabs') as HTMLDivElement

let activeExample: DemoExample = examples[0]
let generation = 0
let mountHandle: { revoke(): void } | null = null
let debounceTimer: ReturnType<typeof setTimeout>

const createRenderer = (example: DemoExample) =>
  createPdfRenderer({
    plugins: example.plugins,
    components: example.components,
  })

let renderPdf = createRenderer(activeExample)

const updatePreview = async (markdown: string) => {
  const current = ++generation
  pageCount.textContent = 'Rendering…'

  try {
    const bytes = await renderPdf(markdown)
    if (current !== generation) return

    mountHandle?.revoke()
    mountHandle = mount(preview, bytes)
    pageCount.textContent = 'Ready'
  }
  catch (error) {
    if (current !== generation) return
    pageCount.textContent = 'Error'
    console.error(error)
  }
}

const selectExample = (example: DemoExample) => {
  activeExample = example
  renderPdf = createRenderer(example)
  input.value = example.markdown

  for (const button of exampleTabs.querySelectorAll<HTMLButtonElement>('button')) {
    button.classList.toggle('active', button.dataset.id === example.id)
  }

  void updatePreview(example.markdown)
}

for (const example of examples) {
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.id = example.id
  button.textContent = example.label
  button.classList.toggle('active', example.id === activeExample.id)
  button.addEventListener('click', () => selectExample(example))
  exampleTabs.appendChild(button)
}

input.value = activeExample.markdown
void updatePreview(activeExample.markdown)

input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => updatePreview(input.value), 300)
})
