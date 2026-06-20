import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink } from '@angular/router'
import { getAllPosts, type PostMeta } from '../lib/posts'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>
      <h1 class="text-3xl font-bold mb-2">Comark Blog</h1>
      <p class="text-neutral-500 dark:text-neutral-400 mb-8">
        A blog built with
        <a
          href="https://angular.dev"
          class="underline"
          >Angular</a
        >
        and
        <a
          href="https://comark.dev"
          class="underline"
          >Comark</a
        >
        rendering.
      </p>
      @if (posts.length === 0) {
        <p class="text-neutral-400">Loading posts...</p>
      }
      <ul class="space-y-6 list-none p-0">
        @for (post of posts; track post.slug) {
          <li>
            <a
              [routerLink]="['/post', post.slug]"
              class="group block rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 transition hover:border-neutral-400 dark:hover:border-neutral-600 no-underline cursor-pointer"
            >
              <h2 class="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                {{ post.title }}
              </h2>
              <p class="text-neutral-500 dark:text-neutral-400 text-sm mb-2">
                {{ post.description }}
              </p>
              <div class="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                <time [attr.datetime]="post.pubDate">
                  {{ formatDate(post.pubDate) }}
                </time>
                <div class="flex gap-1.5">
                  @for (tag of post.tags; track tag) {
                    <span
                      class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    >
                      {{ tag }}
                    </span>
                  }
                </div>
              </div>
            </a>
          </li>
        }
      </ul>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  posts: PostMeta[] = []

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    this.posts = await getAllPosts()
    this.cdr.detectChanges()
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}
