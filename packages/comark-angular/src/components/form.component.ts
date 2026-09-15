import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, inject } from '@angular/core'

/**
 * `::form` aggregate component.
 *
 * Wraps its children in a `<form>` element.  On submit, collects native
 * `FormData` from the form and emits the aggregated field values via
 * `updateValue`, which the Comark renderer wires to write back to the model
 * path bound to `::value`.
 *
 * @example
 * ```html
 * <!-- Markdown: ::form{::value="data.contact"} -->
 * <comark-form [value]="formData" (updateValue)="onFormSubmit($event)" />
 * ```
 */
@Component({
  selector: 'comark-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<form (submit)="handleSubmit($event)"><ng-content /></form>',
})
export class Form {
  /** Current aggregated form value — supplied by the renderer from the model. */
  @Input() value?: Record<string, unknown>

  /** Emitted with the collected `FormData` aggregate on form submit. */
  @Output() updateValue = new EventEmitter<Record<string, unknown>>()

  private elementRef = inject(ElementRef)

  handleSubmit(e: Event): void {
    e.preventDefault()
    const formEl = (this.elementRef.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement | null
    if (!formEl) return
    const fd = new FormData(formEl)
    const aggregate = Object.fromEntries(fd.entries()) as Record<string, unknown>
    this.updateValue.emit(aggregate)
  }
}
