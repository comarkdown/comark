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
          <ul class="mt-3 space-y-2">
            <li>
              <NuxtLink to="/getting-started/introduction" class="text-xs text-muted hover:text-highlighted">
                Getting Started
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/syntax/components" class="text-xs text-muted hover:text-highlighted">
                Syntax
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/rendering/vue" class="text-xs text-muted hover:text-highlighted">
                Rendering
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/api/parse" class="text-xs text-muted hover:text-highlighted">
                API Reference
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="border-b border-default p-6 sm:border-r md:p-8 lg:border-b-0">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-highlighted">
            Plugins
          </h3>
          <ul class="mt-3 space-y-2">
            <li>
              <NuxtLink to="/plugins/core/highlight" class="text-xs text-muted hover:text-highlighted">
                Syntax Highlighting
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/plugins/community/math" class="text-xs text-muted hover:text-highlighted">
                Math
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/plugins/community/cjk" class="text-xs text-muted hover:text-highlighted">
                CJK
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/plugins/community/mermaid" class="text-xs text-muted hover:text-highlighted">
                Mermaid
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="p-6 md:p-8">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-highlighted">
            Community
          </h3>
          <ul class="mt-3 space-y-2">
            <li>
              <NuxtLink to="https://github.com/comarkdown/comark" external class="text-xs text-muted hover:text-highlighted">
                GitHub
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="https://github.com/comarkdown/comark/issues" external class="text-xs text-muted hover:text-highlighted">
                Issues
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="https://github.com/comarkdown/comark/blob/main/CHANGELOG.md" external class="text-xs text-muted hover:text-highlighted">
                Changelog
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="https://github.com/comarkdown/comark/blob/main/LICENSE" external class="text-xs text-muted hover:text-highlighted">
                License
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex items-center justify-between px-6 py-4 md:px-8">
        <p class="text-xs text-dimmed">
          &copy; {{ new Date().getFullYear() }} Comark. Released under the MIT License.
        </p>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="https://github.com/comarkdown/comark"
            external
            class="text-dimmed hover:text-muted"
            aria-label="GitHub"
          >
            <UIcon name="i-simple-icons-github" class="size-4" />
          </NuxtLink>
          <NuxtLink
            to="https://www.npmjs.com/package/comark"
            external
            class="text-dimmed hover:text-muted"
            aria-label="npm"
          >
            <UIcon name="i-simple-icons-npm" class="size-4" />
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
