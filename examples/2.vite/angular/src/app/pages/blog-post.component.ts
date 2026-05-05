import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef } from '@angular/core'
import { ComarkRendererComponent } from '@comark/angular'
import { getPost, type Post } from '../lib/posts'
import { AlertComponent } from '../components/alert.component'

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [ComarkRendererComponent],
  template: `
    @if (post) {
      <article>
        <header class="pb-4 mb-8">
          <a
            (click)="back.emit()"
            class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4 inline-block no-underline cursor-pointer"
          >
            &larr; Back to all posts
          </a>
          <h1 class="text-3xl font-bold mb-2">{{ post.title }}</h1>
          <div class="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <time [attr.datetime]="post.pubDate">
              {{ formatDate(post.pubDate) }}
            </time>
            <div class="flex gap-1.5">
              @for (tag of post.tags; track tag) {
                <span class="px-1.5 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {{ tag }}
                </span>
              }
            </div>
          </div>
        </header>
        <comark-renderer
          [tree]="post.tree"
          [components]="components"
        />
      </article>
    }
  `,
})
export class BlogPostComponent implements OnChanges {
  @Input() slug = ''
  @Output() back = new EventEmitter<void>()
  post: Post | null = null
  components = { alert: AlertComponent }

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnChanges() {
    if (this.slug) {
      this.post = await getPost(this.slug)
      this.cdr.detectChanges()
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}
