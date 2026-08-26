const COPIED_TIMEOUT = 2000

/**
 * `<prose-copy>` — copies the text of the sibling code block.
 *
 * Wraps the button emitted by the `prose` plugin. Copies the `<pre>` text content at
 * click time (so highlighted markup is fine), flips `data-copied` for the stylesheet to
 * swap the icon, and announces the result in a visually hidden live region.
 */
export class ProseCopyElement extends HTMLElement {
  private timeout: ReturnType<typeof setTimeout> | undefined
  private status: HTMLElement | undefined

  connectedCallback(): void {
    this.addEventListener('click', this)
    if (!this.status) {
      const status = document.createElement('span')
      status.setAttribute('role', 'status')
      status.className = 'prose-sr-only'
      this.append(status)
      this.status = status
    }
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this)
    if (this.timeout) clearTimeout(this.timeout)
  }

  handleEvent(event: Event): void {
    if (!(event.target as HTMLElement | null)?.closest('button')) return
    const pre = (this.closest('.prose-pre') ?? this.parentElement)?.querySelector('pre')
    if (!pre) return

    navigator.clipboard.writeText(pre.textContent ?? '').then(() => {
      this.setAttribute('data-copied', '')
      if (this.status) this.status.textContent = 'Copied'
      if (this.timeout) clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.removeAttribute('data-copied')
        if (this.status) this.status.textContent = ''
      }, COPIED_TIMEOUT)
    })
  }
}
