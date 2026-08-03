import { ChangeDetectorRef, Component, type OnInit } from '@angular/core'
import { MarkdownDocument } from '@comark/angular'
import { createComarkContext, parseMarkdown, type MarkdownDocument as Document } from 'comark'

// A driver installs a context on globalThis once; every <comark-markdown-document comarkKey>
// then auto-subscribes. The buttons act as the driver here — but it could just as
// well be HMR, a collab socket, an agent, or devtools.
const ctx = createComarkContext()

const INITIAL = `# Live document

This paragraph is rendered from a **comark-markdown-document** wired to \`globalThis.comarkContext\`.

Use the buttons to push updates by key — no re-mount.

Open the browser console and try:
\`\`\`
const ctx = globalThis.comarkContext.get('demo')
ctx.patch({ op: 'replace', path: [0, 0], node: 'Live document update' })
\`\`\`
`

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [MarkdownDocument],
  template: `
    @if (tree) {
      <div class="flex gap-2 mb-6 not-prose">
        <button
          class="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
          (click)="appendParagraph()"
        >
          Append paragraph
        </button>
        <button
          class="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
          (click)="rewriteHeading()"
        >
          Rewrite heading
        </button>
        <button
          class="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
          (click)="reset()"
        >
          Reset
        </button>
      </div>

      <comark-markdown-document
        comarkKey="demo"
        [value]="tree"
      />
    }
  `,
})
export class LiveComponent implements OnInit {
  tree: Document | null = null
  private counter = 0

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const t = await parseMarkdown(INITIAL)
    console.log(t)
    ctx.get('demo', t) // seed the context so patches have a base tree
    this.tree = t
    this.cdr.detectChanges()
  }

  async appendParagraph(): Promise<void> {
    ctx.get('demo').patch({
      op: 'insert',
      path: [99],
      node: (await parseMarkdown(`A paragraph appended at ${++this.counter}.`)).nodes[0]!,
    })
  }

  async rewriteHeading(): Promise<void> {
    ctx.get('demo').patch({
      op: 'replace',
      path: [0],
      node: (await parseMarkdown(`# Rewritten heading (${++this.counter})`)).nodes[0]!,
    })
  }

  async reset(): Promise<void> {
    this.counter = 0
    ctx.get('demo').set(await parseMarkdown('# Live document\n\nReset. Drive me again.'))
  }
}
