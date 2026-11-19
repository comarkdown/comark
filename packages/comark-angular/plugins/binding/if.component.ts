import { Component, ChangeDetectionStrategy } from '@angular/core'

/** Marker component for Angular's structural `::if` renderer. */
@Component({
  selector: 'comark-if',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class If {
  static readonly ɵcomarkIf = true
}
