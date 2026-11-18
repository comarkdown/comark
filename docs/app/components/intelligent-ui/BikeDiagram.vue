<script setup lang="ts">
import type { Ref } from 'vue'
import { whenever } from '@vueuse/core'

type SystemId = 'frame' | 'wheels' | 'drivetrain' | 'brakes' | 'cockpit'

interface System {
  label?: string
  title?: string
  description?: string
}

const props = defineProps<{
  title?: string
  systems?: Partial<Record<SystemId | 'all', System>>
}>()

const SYSTEMS: { id: SystemId; label: string; anchor: [number, number] }[] = [
  { id: 'frame', label: 'Frame', anchor: [215, 84] },
  { id: 'wheels', label: 'Wheels', anchor: [305, 96] },
  { id: 'drivetrain', label: 'Drivetrain', anchor: [175, 138] },
  { id: 'brakes', label: 'Brakes', anchor: [131, 108] },
  { id: 'cockpit', label: 'Cockpit', anchor: [272, 57] },
]

// Offset of each part at full explosion, in viewBox units.
const OFFSETS: Record<string, [number, number]> = {
  frame: [0, -8],
  rearWheel: [-48, 16],
  frontWheel: [48, 16],
  drivetrain: [0, 42],
  brakes: [0, -34],
  cockpit: [0, -40],
}
const ANCHOR_PART: Record<SystemId, string> = {
  frame: 'frame',
  wheels: 'frontWheel',
  drivetrain: 'drivetrain',
  brakes: 'brakes',
  cockpit: 'cockpit',
}

const explode = ref(0)
const active = ref<SystemId | null>(null)

const SPOKES = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6)

const caption = computed(() => props.systems?.[active.value ?? 'all'])
const activeSystem = computed(() => SYSTEMS.find((system) => system.id === active.value))

const label = computed(() => {
  const system = activeSystem.value
  if (!system) return null
  const [x, y] = system.anchor
  const [dx, dy] = OFFSETS[ANCHOR_PART[system.id]]!
  const e = explode.value / 100
  return { x: x + dx * e, y: y + dy * e, text: props.systems?.[system.id]?.label ?? system.label }
})

function part(name: string, system: SystemId) {
  const [dx, dy] = OFFSETS[name]!
  const e = explode.value / 100
  return {
    transform: `translate(${dx * e}px, ${dy * e}px)`,
    opacity: active.value && active.value !== system ? 0.2 : 1,
  }
}

function select(id: SystemId | null) {
  active.value = id
  // A part is easier to spot once the bike is pulled apart.
  if (id && explode.value < 60) explode.value = 80
}

// A demo that hides this diagram until later provides when it shows.
const visible = inject<Ref<boolean>>('intelligent-ui:visible', ref(true))

// Pull the bike apart once, so the reader sees that the diagram moves.
onMounted(() => {
  whenever(visible, () => setTimeout(() => (explode.value = Math.max(explode.value, 60)), 700), {
    immediate: true,
    once: true,
  })
})
</script>

<template>
  <div class="not-prose my-4">
    <p
      v-if="title"
      class="mb-3 text-lg font-semibold text-highlighted"
    >
      {{ title }}
    </p>

    <div class="overflow-hidden rounded-xl bg-elevated text-default">
      <svg
        viewBox="0 0 400 230"
        class="block w-full"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        role="img"
        aria-label="Diagram of a 7-speed bicycle"
      >
        <g
          class="bike-part"
          :style="part('rearWheel', 'wheels')"
        >
          <circle
            cx="95"
            cy="150"
            r="55"
            stroke-width="5"
          />
          <line
            v-for="angle in SPOKES"
            :key="angle"
            x1="95"
            y1="150"
            :x2="95 + Math.cos(angle) * 52"
            :y2="150 + Math.sin(angle) * 52"
            stroke-width="1"
          />
        </g>
        <g
          class="bike-part"
          :style="part('frontWheel', 'wheels')"
        >
          <circle
            cx="305"
            cy="150"
            r="55"
            stroke-width="5"
          />
          <line
            v-for="angle in SPOKES"
            :key="angle"
            x1="305"
            y1="150"
            :x2="305 + Math.cos(angle) * 52"
            :y2="150 + Math.sin(angle) * 52"
            stroke-width="1"
          />
        </g>
        <g
          class="bike-part"
          :style="part('frame', 'frame')"
        >
          <path d="M175 155 L160 75 L270 72 L276 95 Z M175 155 L95 150 L160 75 M276 95 L305 150" />
        </g>
        <g
          class="bike-part"
          :style="part('drivetrain', 'drivetrain')"
        >
          <circle
            cx="175"
            cy="155"
            r="17"
          />
          <circle
            cx="95"
            cy="150"
            r="8"
          />
          <path
            d="M175 138 L95 142 M175 172 L95 158"
            stroke-width="1.5"
          />
          <path d="M175 155 L186 180 M179 182 L193 182 M95 158 L92 172 L100 176" />
        </g>
        <g
          class="bike-part"
          :style="part('brakes', 'brakes')"
        >
          <path d="M124 104 Q131 114 138 104 M273 97 Q280 107 287 97" />
          <path
            d="M281 58 L290 66 M131 104 Q150 80 210 74"
            stroke-width="1.5"
          />
        </g>
        <g
          class="bike-part"
          :style="part('cockpit', 'cockpit')"
        >
          <path d="M270 72 L272 58 M254 62 Q266 53 284 56 L294 61 M160 75 L155 50" />
          <path
            d="M138 48 Q152 42 172 47 Q156 54 138 48 Z"
            fill="currentColor"
          />
        </g>

        <g
          v-if="label"
          class="text-primary"
        >
          <line
            :x1="label.x"
            y1="22"
            :x2="label.x"
            :y2="label.y"
            stroke-width="1"
          />
          <circle
            :cx="label.x"
            :cy="label.y"
            r="3"
            fill="currentColor"
          />
          <text
            :x="label.x"
            y="16"
            text-anchor="middle"
            stroke="none"
            fill="currentColor"
            font-size="9"
            font-weight="600"
          >
            {{ label.text }}
          </text>
        </g>
      </svg>
    </div>

    <USlider
      v-model="explode"
      :min="0"
      :max="100"
      size="sm"
      class="mt-4"
      aria-label="Pull the parts apart"
    />

    <div class="mt-4 flex flex-wrap gap-1.5">
      <UButton
        label="All"
        size="xs"
        color="neutral"
        :variant="active ? 'outline' : 'solid'"
        class="rounded-full"
        @click="select(null)"
      />
      <UButton
        v-for="system in SYSTEMS"
        :key="system.id"
        :label="systems?.[system.id]?.label ?? system.label"
        size="xs"
        color="neutral"
        :variant="active === system.id ? 'solid' : 'outline'"
        class="rounded-full"
        @click="select(system.id)"
      />
    </div>

    <Transition
      name="bike-caption"
      mode="out-in"
    >
      <div
        :key="active ?? 'all'"
        class="mt-4 min-h-20"
      >
        <p class="font-semibold text-highlighted">
          {{ caption?.title }}
        </p>
        <p class="mt-1 text-sm text-muted">
          {{ caption?.description }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bike-part {
  transition:
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}
.bike-caption-enter-active,
.bike-caption-leave-active {
  transition: opacity 0.2s ease;
}
.bike-caption-enter-from,
.bike-caption-leave-to {
  opacity: 0;
}
</style>
