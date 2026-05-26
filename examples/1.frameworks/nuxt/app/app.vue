<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-gray-200 dark:border-gray-800">
      <nav class="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <NuxtLink
          to="/"
          class="text-lg font-semibold text-gray-900 dark:text-white no-underline shrink-0"
        >
          Comark
        </NuxtLink>
        <div class="flex items-center gap-4 text-sm">
          <NuxtLink
            to="/"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white no-underline"
            active-class="!text-gray-900 dark:!text-white font-medium"
          >
            Blog
          </NuxtLink>
          <NuxtLink
            to="/syntax"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white no-underline"
            active-class="!text-gray-900 dark:!text-white font-medium"
          >
            Syntax
          </NuxtLink>
          <NuxtLink
            to="/chat"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white no-underline"
            active-class="!text-gray-900 dark:!text-white font-medium"
          >
            Chat
          </NuxtLink>
        </div>
      </nav>
    </header>
    <main class="max-w-2xl mx-auto px-6 py-8 flex-1 w-full">
      <NuxtPage />
    </main>
    <footer
      class="border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 py-6"
    >
      Built with
      <a
        href="https://nuxt.com"
        class="text-gray-700 dark:text-gray-300 underline"
        >Nuxt</a
      >
      +
      <a
        href="https://ui.nuxt.com"
        class="text-gray-700 dark:text-gray-300 underline"
        >Nuxt UI</a
      >
      +
      <a
        href="https://comark.dev"
        class="text-gray-700 dark:text-gray-300 underline"
        >Comark</a
      >
    </footer>
  </div>
</template>
