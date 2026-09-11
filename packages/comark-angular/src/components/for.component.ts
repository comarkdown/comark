import { Component, ChangeDetectionStrategy } from '@angular/core'

/** Structural marker interpreted by the Markdown renderer. */
@Component({ selector: 'comark-for', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: '' })
export class For {
  static readonly __comarkFor = true
}
