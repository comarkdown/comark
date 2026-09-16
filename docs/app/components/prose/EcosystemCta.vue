<template>
  <div
    class="not-prose mt-14 flex flex-col gap-4 rounded-lg border border-default bg-muted p-6 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <p class="text-base font-semibold text-highlighted">Add your project</p>
      <p class="mt-1 text-sm text-muted">
        Building on Comark? Open a pull request adding a card, or open an issue first if you aren't sure it fits.
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-3">
      <UButton
        to="https://github.com/comarkdown/comark/edit/main/docs/content/9.ecosystem.md"
        icon="i-lucide-plus"
        target="_blank"
        color="neutral"
      >
        Add your project
      </UButton>
      <UButton
        to="https://github.com/comarkdown/comark/issues/new"
        target="_blank"
        color="neutral"
        variant="outline"
      >
        Open an issue
      </UButton>
    </div>
  </div>
</template>
