interface EmailPreviewResult {
  html: string
  subject?: string
  previewText?: string
  errors: unknown[]
}

const SAMPLE = `---
email:
  subject: "Your order has shipped!"
  previewText: "Track your package delivery status."
  theme:
    primary: "#0066cc"
    background: "#f4f5f7"
---

# Order Shipped

Your order is on its way.

::email-button{href="https://example.com/track" class="bg-primary text-white py-3 px-6"}
Track Package
::

## What's next

::email-columns
Left column content.

Right column content.
::

::email-divider{class="border-gray-200"}
::

A final paragraph to confirm rendering.
`

const input = document.getElementById('input') as HTMLTextAreaElement
const subject = document.getElementById('subject') as HTMLSpanElement
const previewText = document.getElementById('preview-text') as HTMLSpanElement
const frame = document.getElementById('preview') as HTMLIFrameElement

const updatePreview = async (markdown: string) => {
  const response = await fetch('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown }),
  })
  const result = (await response.json()) as EmailPreviewResult
  subject.textContent = result.subject ?? ''
  previewText.textContent = result.previewText ?? ''
  frame.srcdoc = result.html
}

input.value = SAMPLE
void updatePreview(SAMPLE)

let debounceTimer: ReturnType<typeof setTimeout>
input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void updatePreview(input.value)
  }, 150)
})
