import { Component, Input } from '@angular/core'
import { NgClass } from '@angular/common'

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      class="alert my-4 rounded-lg border-l-4 px-4 py-3"
      [ngClass]="{
        'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:text-blue-300': type === 'info',
        'bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300': type === 'warning',
        'bg-red-50 border-red-500 text-red-700 dark:bg-red-950 dark:text-red-300': type === 'error',
        'bg-green-50 border-green-500 text-green-700 dark:bg-green-950 dark:text-green-300': type === 'success',
      }"
      role="alert"
    >
      <ng-content />
    </div>
  `,
})
export class AlertComponent {
  @Input() type: 'info' | 'warning' | 'error' | 'success' = 'info'
}
