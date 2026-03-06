<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const { headline = '' } = defineProps<{
  title?: string
  description?: string
  headline?: string
}>()

function truncate(str: string, max: number) {
  if (!str || str.length <= max) return str
  const cut = str.lastIndexOf(' ', max)
  return `${str.slice(0, cut > 0 ? cut : max)}…`
}
</script>

<template>
  <div class="flex flex-row size-full">
    <div
      class="flex flex-col items-center justify-between"
      style="width:200px;background:#eab308;padding:48px 0;"
    >
      <div style="flex:1;display:flex;align-items:center;justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="62" viewBox="0 0 208 128" fill="none">
          <path stroke="#09090b" stroke-width="8" d="M199 9v110H9V9h190Z" />
          <path fill="#09090b" d="M128 51.25V32h19.937v19.25H128ZM128 96V76.75h19.937V96H128ZM158.063 51.25V32H178v19.25h-19.937Zm0 44.75V76.75H178V96h-19.937ZM30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39H30Z" />
        </svg>
      </div>
      <div style="font-family:'Geist Mono';font-size:11px;font-weight:600;color:#09090b;letter-spacing:0.12em;opacity:0.5;">
        comark.dev
      </div>
    </div>

    <div
      class="flex flex-col flex-1"
      style="background:#09090b;position:relative;overflow:hidden;"
    >
      <div
        style="position:absolute;inset:0;background-image:radial-gradient(circle, rgba(234,179,8,0.03) 1px, transparent 1px);background-size:28px 28px;"
      />

      <div class="flex flex-col flex-1 justify-center" style="position:relative;z-index:1;padding:48px 56px;">
        <div
          v-if="headline"
          style="font-family:'Geist Mono';font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#eab308;margin-bottom:24px;"
        >
          {{ headline }}
        </div>

        <div
          style="font-family:'Geist';font-size:72px;font-weight:800;color:#fafafa;line-height:1;letter-spacing:-0.035em;"
        >
          {{ title || 'Comark' }}
        </div>

        <div
          v-if="description"
          style="font-family:'Geist';font-size:24px;color:#a1a1aa;line-height:1.5;margin-top:24px;max-width:700px;"
        >
          {{ truncate(description, 120) }}
        </div>
      </div>

      <div style="position:relative;z-index:1;padding:0 56px 36px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="flex:1;height:1px;background:rgba(234,179,8,0.15);" />
          <div style="font-family:'Geist Mono';font-size:13px;font-weight:500;letter-spacing:0.12em;color:rgba(234,179,8,0.6);">
            COMPONENTS IN MARKDOWN
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
