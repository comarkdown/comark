<template>
  <div class="not-prose mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
    <div class="prose prose-sm max-w-none dark:prose-invert prose-headings:no-underline">
      <slot name="left" />
    </div>
    <div class="self-start lg:sticky lg:top-4">
      <slot name="right" />
    </div>
  </div>
</template>
