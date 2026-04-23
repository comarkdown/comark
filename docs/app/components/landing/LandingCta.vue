<script setup lang="ts">
defineProps<{
  title: string
  description: string
  install: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
}>()
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="cta-dots absolute inset-0" />
      <div
        class="absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[100px]"
      />

      <div class="relative px-5 py-16 text-center sm:px-8 sm:py-24 md:px-12 md:py-32">
        <h2 class="text-3xl font-bold text-highlighted md:text-4xl">
          {{ title }}
        </h2>
        <p class="mx-auto mt-4 max-w-lg text-base/7 text-muted">
          {{ description }}
        </p>

        <div class="mt-8 flex items-center justify-center gap-3">
          <UButton
            :label="primaryLabel"
            :to="primaryTo"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
          />
          <UButton
            :label="secondaryLabel"
            :to="secondaryTo"
            external
            color="neutral"
            variant="outline"
            icon="i-simple-icons-github"
          />
        </div>

        <div class="mt-6">
          <UInputCopy :value="install" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cta-dots {
  background-image: radial-gradient(circle, rgb(161 161 170 / 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 10%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 10%, transparent 70%);
}
</style>
