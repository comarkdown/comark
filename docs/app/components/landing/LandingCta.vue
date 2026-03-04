<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent" />

      <div class="relative px-8 py-20 text-center md:px-12 md:py-28">
        <h2 class="text-3xl font-bold text-highlighted md:text-4xl">
          Start writing
        </h2>
        <p class="mx-auto mt-3 max-w-md text-sm/6 text-muted">
          Add rich, interactive components to your markdown today.
        </p>

        <div class="mt-8">
          <UInputCopy value="npm install comark" />
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <UButton
            to="/getting-started/introduction"
            size="xl"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
          >
            Get Started
          </UButton>
          <UButton
            to="https://github.com/comarkdown/comark"
            external
            size="xl"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-github"
          >
            GitHub
          </UButton>
        </div>
      </div>
    </section>

    <footer class="border-b border-default">
      <div class="grid border-b border-default sm:grid-cols-2 lg:grid-cols-4">
        <div class="border-b border-default p-6 sm:border-r md:p-8 lg:border-b-0">
          <AppHeaderLogo class="h-5 text-highlighted" />
          <p class="mt-3 max-w-xs text-xs/5 text-muted">
            A fast, streaming-ready markdown parser with component support for Vue and React.
          </p>
        </div>

        <div class="border-b border-default p-6 md:p-8 lg:border-r lg:border-b-0">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-highlighted">
            Documentation
          </h3>
          <ul class="mt-3 space-y-1">
            <li>
              <UButton
                label="Getting Started"
                to="/getting-started/introduction"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="Syntax"
                to="/syntax/components"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="Rendering"
                to="/rendering/vue"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="API Reference"
                to="/api/parse"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
          </ul>
        </div>

        <div class="border-b border-default p-6 sm:border-r md:p-8 lg:border-b-0">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-highlighted">
            Plugins
          </h3>
          <ul class="mt-3 space-y-1">
            <li>
              <UButton
                label="Syntax Highlighting"
                to="/plugins/core/highlight"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="Math"
                to="/plugins/community/math"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="CJK"
                to="/plugins/community/cjk"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="Mermaid"
                to="/plugins/community/mermaid"
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
          </ul>
        </div>

        <div class="p-6 md:p-8">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-highlighted">
            Community
          </h3>
          <ul class="mt-3 space-y-1">
            <li>
              <UButton
                label="GitHub"
                to="https://github.com/comarkdown/comark"
                external
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="Issues"
                to="https://github.com/comarkdown/comark/issues"
                external
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="Changelog"
                to="https://github.com/comarkdown/comark/blob/main/CHANGELOG.md"
                external
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
            <li>
              <UButton
                label="License"
                to="https://github.com/comarkdown/comark/blob/main/LICENSE"
                external
                variant="link"
                color="neutral"
                size="xs"
                class="px-0"
              />
            </li>
          </ul>
        </div>
      </div>

      <div class="flex items-center justify-between px-6 py-4 md:px-8">
        <p class="text-xs text-dimmed">
          &copy; {{ new Date().getFullYear() }} Comark. Released under the MIT License.
        </p>
        <div class="flex items-center gap-1">
          <UButton
            to="https://github.com/comarkdown/comark"
            external
            icon="i-simple-icons-github"
            variant="ghost"
            color="neutral"
            size="xs"
            aria-label="GitHub"
          />
          <UButton
            to="https://www.npmjs.com/package/comark"
            external
            icon="i-simple-icons-npm"
            variant="ghost"
            color="neutral"
            size="xs"
            aria-label="npm"
          />
        </div>
      </div>
    </footer>
  </div>
</template>
