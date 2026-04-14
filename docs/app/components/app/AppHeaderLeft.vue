<template>
  <div class="flex shrink-0 items-end gap-2.5">
    <NuxtLink
      to="https://vercel.com"
      aria-label="Vercel"
      target="_blank"
      rel="noopener"
      class="flex"
    >
      <Icon
        name="i-simple-icons-vercel"
        class="size-5 shrink-0 text-black dark:text-white"
      />
    </NuxtLink>
    <svg
      aria-hidden="true"
      stroke-linejoin="round"
      viewBox="0 0 16 16"
      class="size-5 text-(--ui-border)"
    ><title>Slash</title><path
      clip-rule="evenodd"
      d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
      fill="currentColor"
      fill-rule="evenodd"
    /></svg>
    <NuxtLink
      to="/"
      aria-label="Comark"
    >
      <AppHeaderLogo class="h-5 w-auto shrink-0" />
    </NuxtLink>
  </div>
</template>
