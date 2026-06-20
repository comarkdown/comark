import { Component } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-neutral-200 dark:border-neutral-800">
        <nav class="max-w-2xl mx-auto px-6 py-4 flex items-center gap-6">
          <a
            routerLink="/"
            class="text-lg font-semibold text-neutral-900 dark:text-white no-underline cursor-pointer"
          >
            Comark Blog
          </a>
          <a
            routerLink="/syntax"
            class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 no-underline cursor-pointer"
          >
            Syntax
          </a>
        </nav>
      </header>
      <main class="max-w-2xl mx-auto px-6 py-8 flex-1 w-full prose">
        <router-outlet />
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
export class AppComponent {}
