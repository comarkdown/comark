import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core'
import type { ElementNode } from 'comark'
import { textContent } from 'comark/utils'

@Component({
  selector: 'app-code-block',
  template: `
    <div class="code-block">
      <div class="code-block-header">
        <span>{{ label() }}</span>
        <button
          type="button"
          [disabled]="!code()"
          [attr.aria-label]="copied() ? 'Code copied to clipboard' : 'Copy code to clipboard'"
          class="rounded px-2 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
          (click)="copy()"
        >
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <pre
        [attr.data-filename]="filename()"
        [attr.data-language]="language()"
      ><ng-content /></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly __node = input<ElementNode>()
  readonly filename = input<string>()
  readonly language = input<string>()

  readonly code = computed(() => (this.__node() ? textContent(this.__node()!) : ''))
  readonly label = computed(() => this.filename() || this.language()?.toUpperCase() || 'Code')
  readonly copied = signal(false)

  private resetTimer?: ReturnType<typeof setTimeout>

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer))
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code())
      this.copied.set(true)
      clearTimeout(this.resetTimer)
      this.resetTimer = setTimeout(() => this.copied.set(false), 2000)
    } catch {
      this.copied.set(false)
    }
  }
}
