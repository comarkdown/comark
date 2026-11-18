import { Component, inject, signal } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { MarkdownDocument, defineMarkdownDocumentComponent } from '@comark/angular'
import { AlertComponent } from '../components/alert.component'
import { CodeBlockComponent } from '../components/code-block.component'
import { FeatureCardComponent } from '../components/feature-card.component'
import { getPost, type Post } from '../lib/posts'

@Component({
  selector: 'app-blog-post',
  imports: [MarkdownDocument, RouterLink],
  providers: [
    defineMarkdownDocumentComponent({
      components: {
        alert: AlertComponent,
        'feature-card': FeatureCardComponent,
        pre: CodeBlockComponent,
      },
      class: 'prose',
    }),
  ],
  template: `
    @if (post(); as current) {
      <article>
        <header class="pb-4 mb-8">
          <a
            routerLink="/"
            class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4 inline-block no-underline"
          >
            &larr; Back to all posts
          </a>
          <h1 class="text-3xl font-bold mb-2">{{ current.title }}</h1>
          <div class="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <time [attr.datetime]="current.pubDate">{{ formatDate(current.pubDate) }}</time>
            <div class="flex gap-1.5">
              @for (tag of current.tags; track tag) {
                <span
                  class="px-1.5 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  {{ tag }}
                </span>
              }
            </div>
          </div>
        </header>
        <comark-markdown-document [value]="current.tree" />
      </article>
    }
  `,
})
export class BlogPostComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly title = inject(Title)
  readonly post = signal<Post | null>(null)

  constructor() {
    this.route.params.subscribe((params) => {
      const slug = params['slug']
      if (slug) {
        getPost(slug).then((post) => {
          this.post.set(post)
          this.title.setTitle(`${post.title} | Comark Blog`)
        })
      }
    })
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }
}
