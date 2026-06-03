import { Component } from '@angular/core'

/**
 * A card component demonstrating named slot support in Comark.
 *
 * Slots:
 * - `header` — rendered in the card header area
 * - `default` — rendered in the card body
 * - `footer` — rendered in the card footer area
 */
@Component({
  selector: 'app-feature-card',
  standalone: true,
  template: `
    <section
      class="my-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div
        class="border-b border-neutral-200 bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100 [&_p]:mb-0"
      >
        <ng-content select="[slot=header]" />
      </div>
      <div class="px-4 py-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 [&_p:last-child]:mb-0">
        <ng-content />
      </div>
      <div
        class="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400 [&_p]:mb-0"
      >
        <ng-content select="[slot=footer]" />
      </div>
    </section>
  `,
})
export class FeatureCardComponent {}
