import { Component, OnChanges, SimpleChanges, ChangeDetectionStrategy, ElementRef, inject, input } from '@angular/core'

let katex: typeof import('katex').default | undefined
let loading: Promise<unknown> | undefined

function loadKatex(): Promise<unknown> {
  loading ??= import('katex').then(
    (module) => (katex = module.default),
    (error) => {
      loading = undefined
      throw error
    }
  )
  return loading
}

// HTML, `''` when KaTeX can't typeset the formula, or `undefined` before KaTeX loads.
function typeset(tex: string, displayMode: boolean): string | undefined {
  if (!katex) return undefined
  try {
    return katex.renderToString(tex, { throwOnError: true, displayMode })
  } catch {
    return ''
  }
}

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
  readonly content = input.required<string>()
  readonly class = input<string>('')
  readonly __node = input<any>({})

  private elementRef = inject(ElementRef)

  ngOnChanges(_changes: SimpleChanges): void {
    this.renderMath()
  }

  private renderMath(): void {
    if (typeof document === 'undefined') return

    const isInline = this.class()?.includes('inline')
    const hostEl = this.elementRef.nativeElement as HTMLElement

    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }

    const wrapper = document.createElement(isInline ? 'span' : 'div')
    wrapper.className = isInline ? 'math inline' : 'math block'

    const content = this.content()
    const html = typeset(content, !isInline)
    if (html) {
      wrapper.innerHTML = html
    } else {
      // Unfinished or invalid TeX, and TeX before KaTeX loads, stays readable as its source.
      wrapper.textContent = content
      if (html === undefined) {
        loadKatex().then(
          () => content === this.content() && this.renderMath(),
          () => {}
        )
      }
    }

    hostEl.appendChild(wrapper)
  }
}
