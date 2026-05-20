<template>
  <div class="text-sm mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
    <div class="text-sm">
      <slot name="left" />
    </div>
    <div class="self-start lg:sticky lg:top-(--ui-header-height)">
      <slot name="right" />
    </div>
  </div>
</template>
