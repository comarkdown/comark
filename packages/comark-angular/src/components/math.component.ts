import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ElementRef } from '@angular/core'
import katex from 'katex'

/**
 * Math rendering component for Angular.
 * Renders LaTeX math expressions using KaTeX.
 *
 * Note: Consumers must import `katex/dist/katex.min.css` in their own
 * project to load the KaTeX styles (e.g. in `styles.css` or a global import).
 *
 * @example
 * ```typescript
 * import { Math } from '@comark/angular/plugins/math'
 * ```
 */
@Component({
  selector: 'comark-math',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class Math implements OnChanges {
  @Input({ required: true }) content!: string
  @Input() class: string = ''
  @Input() __node: any = {}

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.renderMath()
  }

  private renderMath(): void {
    if (typeof document === 'undefined') return

    const isInline = this.class?.includes('inline')
    const hostEl = this.elementRef.nativeElement as HTMLElement

    // Clear previous content
    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }

    const wrapper = document.createElement(isInline ? 'span' : 'div')
    wrapper.className = isInline ? 'math inline' : 'math block'

    try {
      wrapper.innerHTML = katex.renderToString(this.content, {
        throwOnError: true,
        displayMode: !isInline,
      })
    } catch {
      wrapper.textContent = '...'
    }

    hostEl.appendChild(wrapper)
  }
}
