import { Component, DestroyRef, inject, signal } from '@angular/core'
import { Markdown } from '@comark/angular'
import { store, type StreamState } from '../shared/store'

@Component({
  selector: 'angular-column',
  imports: [Markdown],
  template: `
    <comark-markdown
      [value]="state().streamed"
      [streaming]="state().streaming"
      [plugins]="state().plugins"
      [effects]="state().effects"
    />
  `,
})
export class AngularColumn {
  readonly state = signal<StreamState>(store.getState())

  constructor() {
    const unsubscribe = store.subscribe((next) => this.state.set(next))
    inject(DestroyRef).onDestroy(unsubscribe)
  }
}
