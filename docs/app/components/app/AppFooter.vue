<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div :class="[$route.path === '/' ? '' : 'border-t border-default']">
    <UContainer
      class="border-default border-b"
      :class="[$route.path === '/' ? 'px-0! border-x' : '']"
    >
      <footer>
        <div class="grid border-b border-default sm:grid-cols-2 lg:grid-cols-4">
          <div class="border-b border-default p-6 sm:border-r md:p-8 lg:border-b-0">
            <AppHeaderLogo class="h-5 text-highlighted" />
            <p class="mt-3 max-w-xs text-xs/5 text-muted">
              A fast, streaming-ready markdown parser with component support for Vue, React, and Svelte.
            </p>
          </div>

          <div
            v-for="(section, i) in appConfig.footer.sections"
            :key="section.title"
            class="p-6 md:p-8"
            :class="{
              'border-b border-default lg:border-r lg:border-b-0': i === 0,
              'border-b border-default sm:border-r lg:border-b-0': i === 1,
            }"
          >
            <h3 class="text-xs font-semibold uppercase tracking-wider text-highlighted">
              {{ section.title }}
            </h3>
            <ul class="mt-3 space-y-1">
              <li
                v-for="link in section.links"
                :key="link.to"
              >
                <UButton
                  :label="link.label"
                  :to="link.to"
                  :external="link.to.startsWith('https://')"
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
            Copyright
            <a
              href="https://vercel.com"
              target="_blank"
              class="text-default"
              rel="noopener"
              >Vercel</a
            >
            2026. Released under the
            <a
              href="https://github.com/comarkdown/comark/blob/main/LICENSE"
              target="_blank"
              class="text-default"
              rel="noopener"
              >MIT License</a
            >.
          </p>
          <div class="flex items-center gap-1">
            <UColorModeButton size="xs" />
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
              to="https://npmx.dev/package/comark"
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
    </UContainer>
  </div>
</template>
