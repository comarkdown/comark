import {
  Component,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core'
import { renderMermaidSVG, THEMES, type DiagramColors } from 'beautiful-mermaid'
import type { ThemeNames } from 'comark/plugins/mermaid'

/**
 * Mermaid diagram rendering component for Angular.
 * Renders Mermaid diagrams using beautiful-mermaid.
 *
 * @example
 * ```typescript
 * import { Mermaid } from '@comark/angular/plugins/mermaid'
 * ```
 */
@Component({
  selector: 'comark-mermaid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class Mermaid implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) content!: string
  @Input() class: string = ''
  @Input() height: string = 'auto'
  @Input() width: string = '100%'
  @Input() theme?: ThemeNames | DiagramColors
  @Input() themeDark?: ThemeNames | DiagramColors

  private isDark = false
  private observer?: MutationObserver

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof document === 'undefined') return

    const htmlEl = document.querySelector('html')
    if (htmlEl) {
      this.isDark = htmlEl.classList.contains('dark')

      this.observer = new MutationObserver(() => {
        const newIsDark = htmlEl.classList.contains('dark')
        if (newIsDark !== this.isDark) {
          this.isDark = newIsDark
          this.renderDiagram()
        }
      })

      this.observer.observe(htmlEl, {
        attributes: true,
        attributeFilter: ['class'],
      })
    }

    this.renderDiagram()
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.renderDiagram()
  }

  ngOnDestroy(): void {
    this.observer?.disconnect()
  }

  private getTheme(): DiagramColors {
    const themeProp = this.isDark ? this.themeDark : this.theme

    let resolvedTheme: DiagramColors | undefined
    if (typeof themeProp === 'string') {
      resolvedTheme = THEMES[themeProp]
    } else if (typeof themeProp === 'object') {
      resolvedTheme = themeProp
    }

    if (!resolvedTheme) {
      resolvedTheme = THEMES[this.isDark ? 'tokyo-night' : 'tokyo-light']
    }

    return resolvedTheme
  }

  private renderDiagram(): void {
    if (typeof document === 'undefined') return

    const hostEl = this.elementRef.nativeElement as HTMLElement

    // Clear previous content
    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }

    const wrapper = document.createElement('div')
    wrapper.className = `mermaid ${this.class}`
    wrapper.style.display = 'flex'
    wrapper.style.justifyContent = 'center'
    wrapper.style.width = this.width
    wrapper.style.height = this.height

    try {
      const svg = renderMermaidSVG(this.content, this.getTheme())
      wrapper.innerHTML = svg
    } catch (err) {
      wrapper.dataset['error'] = err instanceof Error ? err.message : 'Failed to render diagram'
    }

    hostEl.appendChild(wrapper)
  }
}
