import { Component, signal } from '@angular/core'
import { HomeComponent } from './pages/home.component'
import { BlogPostComponent } from './pages/blog-post.component'
import { SyntaxComponent } from './pages/syntax.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, BlogPostComponent, SyntaxComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-neutral-200 dark:border-neutral-800">
        <nav class="max-w-2xl mx-auto px-6 py-4 flex items-center gap-6">
          <button
            type="button"
            (click)="navigate('home')"
            class="text-lg font-semibold text-neutral-900 dark:text-white no-underline cursor-pointer bg-transparent border-none p-0"
          >
            Comark Blog
          </button>
          <button
            type="button"
            (click)="navigate('syntax')"
            class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 no-underline cursor-pointer bg-transparent border-none p-0"
          >
            Syntax
          </button>
        </nav>
      </header>
      <main class="max-w-2xl mx-auto px-6 py-8 flex-1 w-full prose">
        @switch (view()) {
          @case ('home') {
            <app-home (openPost)="openPost($event)" />
          }
          @case ('blog') {
            <app-blog-post
              [slug]="currentSlug()"
              (back)="navigate('home')"
            />
          }
          @case ('syntax') {
            <app-syntax />
          }
        }
      </main>
      <footer
        class="border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400 py-6"
      >
        Built with
        <a
          href="https://angular.dev"
          class="text-neutral-700 dark:text-neutral-300 underline"
          >Angular</a
        >
        +
        <a
          href="https://comark.dev"
          class="text-neutral-700 dark:text-neutral-300 underline"
          >Comark</a
        >
      </footer>
    </div>
  `,
})
export class AppComponent {
  view = signal<'home' | 'blog' | 'syntax'>('home')
  currentSlug = signal('')

  navigate(view: 'home' | 'syntax') {
    this.view.set(view)
  }

  openPost(slug: string) {
    this.currentSlug.set(slug)
    this.view.set('blog')
  }
}
