<template>
  <div class="not-prose relative my-6 grid h-72 grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 overflow-hidden rounded-xl">
    <div class="row-span-2 overflow-hidden [&_img]:block [&_img]:size-full [&_img]:object-cover">
      <slot name="main" />
    </div>
    <div class="col-span-2 row-span-2 grid grid-cols-2 grid-rows-2 gap-2 *:overflow-hidden [&>p]:m-0 [&_img]:block [&_img]:size-full [&_img]:object-cover">
      <slot name="thumbnails" />
    </div>
    <button class="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium shadow-sm dark:border-neutral-600 dark:bg-neutral-800">
      <UIcon
        name="i-lucide-grid-2x2"
        class="size-3"
      />
      Show all photos
    </button>
  </div>
</template>
