<template>
  <UPageHero
    :ui="{
      container: 'py-24',
      title: 'text-3xl sm:text-4xl font-bold tracking-tight text-highlighted',
      description: 'text-lg text-muted',
      body: 'mx-auto max-w-4xl text-left',
      footer: 'mx-auto max-w-4xl text-left',
    }"
  >
    <template
      v-if="$slots.headline"
      #headline
    >
      <UBadge
        variant="subtle"
        size="lg"
        class="mb-4"
      >
        <template #leading>
          <UIcon
            name="i-lucide-zap"
            class="h-4 w-4"
          />
        </template>
        <slot
          name="headline"
          mdc-unwrap="p"
        />
      </UBadge>
    </template>
    <template #title>
      <slot
        name="title"
        mdc-unwrap="p"
      />
    </template>
    <template #description>
      <slot
        name="description"
        mdc-unwrap="p"
      />
    </template>
    <template #body>
      <slot name="body" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
  </UPageHero>
</template>
