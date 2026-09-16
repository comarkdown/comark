<template>
  <div
    class="not-prose mt-14 flex flex-col gap-4 rounded-lg border border-default bg-muted p-6 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <p
        v-if="$slots.title"
        class="text-base font-semibold text-highlighted"
      >
        <slot
          name="title"
          unwrap="p"
        />
      </p>
      <p
        v-if="$slots.description"
        class="mt-1 text-sm text-muted"
      >
        <slot
          name="description"
          unwrap="p"
        />
      </p>
    </div>

    <div
      v-if="$slots.ctas"
      class="flex shrink-0 items-center gap-3"
    >
      <slot name="ctas" />
    </div>
  </div>
</template>
