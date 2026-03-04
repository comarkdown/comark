<script setup lang="ts">
interface FooterLink {
  label: string
  to: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

defineProps<{
  title: string
  description: string
  install: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
  footerDescription: string
  footerSections: FooterSection[]
  footerCopyright: string
  githubUrl: string
  npmUrl: string
}>()
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent" />

      <div class="relative px-8 py-20 text-center md:px-12 md:py-28">
        <h2 class="text-3xl font-bold text-highlighted md:text-4xl">
          {{ title }}
        </h2>
        <p class="mx-auto mt-3 max-w-md text-sm/6 text-muted">
          {{ description }}
        </p>

        <div class="mt-8">
          <UInputCopy :value="install" />
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <UButton
            :label="primaryLabel"
            :to="primaryTo"
            size="xl"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
          />
          <UButton
            :label="secondaryLabel"
            :to="secondaryTo"
            external
            size="xl"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-github"
          />
        </div>
      </div>
    </section>

    <footer class="border-b border-default">
      <div class="grid border-b border-default sm:grid-cols-2 lg:grid-cols-4">
        <div class="border-b border-default p-6 sm:border-r md:p-8 lg:border-b-0">
          <AppHeaderLogo class="h-5 text-highlighted" />
          <p class="mt-3 max-w-xs text-xs/5 text-muted">
            {{ footerDescription }}
          </p>
        </div>

        <div
          v-for="(section, i) in footerSections"
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
                :external="link.external"
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
          {{ footerCopyright }}
        </p>
        <div class="flex items-center gap-1">
          <UButton
            :to="githubUrl"
            external
            icon="i-simple-icons-github"
            variant="ghost"
            color="neutral"
            size="xs"
            aria-label="GitHub"
          />
          <UButton
            :to="npmUrl"
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
