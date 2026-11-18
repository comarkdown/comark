import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core'

@Component({
  selector: 'app-feature-card',
  template: `
    <section
      class="my-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div
        #header
        class="border-b border-neutral-200 bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100 [&_p]:mb-0"
      ></div>
      <div class="px-4 py-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 [&_p:last-child]:mb-0">
        <ng-content />
      </div>
      <div
        #footer
        class="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400 [&_p]:mb-0"
      ></div>
    </section>
  `,
})
export class FeatureCardComponent implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)

  @ViewChild('header') private header?: ElementRef<HTMLElement>
  @ViewChild('footer') private footer?: ElementRef<HTMLElement>

  ngAfterViewInit(): void {
    this.moveSlot('header', this.header?.nativeElement)
    this.moveSlot('footer', this.footer?.nativeElement)
  }

  private moveSlot(name: string, container?: HTMLElement): void {
    if (!container) return
    const slot = this.host.nativeElement.querySelector<HTMLElement>(`:scope > div[slot="${name}"]`)
    if (slot) container.appendChild(slot)
  }
}
