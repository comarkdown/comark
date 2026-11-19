import { Component } from '@angular/core'
import { defineMarkdownComponent } from '../../../src/index.ts'

@Component({
  selector: 'app-factory-markdown',
  standalone: true,
  imports: [defineMarkdownComponent()],
  template: `<comark-markdown-defined [value]="content" />`,
})
export class AppFactoryMarkdownComponent {
  content = '# Hello'
}
