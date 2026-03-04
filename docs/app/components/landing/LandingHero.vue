<script setup lang="ts">
const props = defineProps<{
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
  <section class="relative overflow-hidden border-b border-default">
    <div class="absolute inset-0 hero-dots" />
    <div class="absolute top-1/3 left-1/3 size-[400px] rounded-full bg-primary/20 blur-[120px]" />

    <div class="relative">
      <div class="grid items-center gap-8 p-8 md:p-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <div>
          <div
            class="hero-fade-in"
            style="--delay: 0s"
          >
            <TypingText
              :text="`# ${props.title}`"
              tag="div"
              :speed="100"
              :resolve-delay="500"
              :trigger-on-view="false"
              class="mb-4"
            >
              <template #resolved>
                <h1 class="text-5xl font-bold tracking-tight text-highlighted md:text-6xl">
                  {{ props.title }}
                </h1>
              </template>
            </TypingText>
          </div>

          <div
            class="hero-fade-in"
            style="--delay: 0.15s"
          >
            <p class="max-w-md text-lg/7 text-muted">
              {{ props.description }}
            </p>
          </div>

          <div
            class="hero-fade-in mt-6"
            style="--delay: 0.25s"
          >
            <UInputCopy :value="install" />
          </div>

          <div
            class="hero-fade-in mt-6 flex items-center gap-3"
            style="--delay: 0.35s"
          >
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

        <div
          class="hero-fade-in"
          style="--delay: 0.3s"
        >
          <LandingHeroDemo />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-dots {
  background-image: radial-gradient(circle, rgb(161 161 170 / 0.15) 1px, transparent 1px);
  background-size: 20px 20px;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 70%);
}

:global(.dark) .hero-dots {
  background-image: radial-gradient(circle, rgb(161 161 170 / 0.08) 1px, transparent 1px);
}

@keyframes hero-fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-fade-in {
  animation: hero-fade-in 0.5s ease-out both;
  animation-delay: var(--delay, 0s);
}
</style>
