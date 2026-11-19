import { Component } from '@angular/core'
import type { MarkdownDocument as MarkdownDocumentType } from 'comark'
import { Markdown, MarkdownDocument, provideMarkdown, provideMarkdownDocument } from '../../../src/index.ts'

@Component({
  selector: 'app-markdown',
  standalone: true,
  imports: [Markdown],
  providers: [provideMarkdown({ class: 'prose' })],
  template: `<comark-markdown [value]="content" />`,
})
export class AppMarkdownComponent {
  content = '# Hello'
}

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [MarkdownDocument],
  providers: [provideMarkdownDocument({ class: 'prose' })],
  template: `@if (document) {
    <comark-markdown-document [value]="document" />
  }`,
})
export class AppDocumentComponent {
  document?: MarkdownDocumentType
}
