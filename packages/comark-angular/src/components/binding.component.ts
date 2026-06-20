import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2,
  OnChanges,
  SimpleChanges,
} from '@angular/core'

/**
 * Renders a `{{ path || default }}` binding as plain text.
 *
 * Pair with the `binding` plugin and wire via `components: { binding: BindingComponent }`.
 */
@Component({
  selector: 'comark-binding',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class Binding implements OnChanges {
  /**
   * Resolved value for the binding, injected by the Comark renderer after
   * looking up the `:value` dot-path against the ambient render context.
   */
  @Input() value?: unknown

  /**
   * Fallback rendered when `value` is `undefined` or `null`.
   */
  @Input() defaultValue?: string

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    const hostEl = this.elementRef.nativeElement as HTMLElement
    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }

    const text = this.value !== undefined && this.value !== null ? String(this.value) : (this.defaultValue ?? '')

    const textNode = this.renderer.createText(text)
    this.renderer.appendChild(hostEl, textNode)
  }
}
