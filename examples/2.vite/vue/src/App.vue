<template>
  <Suspense>
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-gray-200 dark:border-gray-800">
        <nav class="max-w-2xl mx-auto px-6 py-4">
          <RouterLink
            to="/"
            class="text-lg font-semibold text-gray-900 dark:text-white no-underline"
          >
            Comark Blog
          </RouterLink>
        </nav>
      </header>
      <main class="max-w-2xl mx-auto px-6 py-8 flex-1 w-full">
        <RouterView />
      </main>
      <footer class="border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 py-6">
        Built with
        <a
          href="https://vuejs.org"
          class="text-gray-700 dark:text-gray-300 underline"
        >Vue</a>
        +
        <a
          href="https://ui.nuxt.com"
          class="text-gray-700 dark:text-gray-300 underline"
        >Nuxt UI</a>
        +
        <a
          href="https://comark.dev"
          class="text-gray-700 dark:text-gray-300 underline"
        >Comark</a>
      </footer>
    </div>
  </Suspense>
</template>
