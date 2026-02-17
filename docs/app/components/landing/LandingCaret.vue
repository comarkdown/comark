<script setup lang="ts">
const markdown = `Awake! for Morning in the Bowl of Night  
Has flung the Stone that puts the Stars to Flight:  
And Lo! the Hunter of the East has caught  
The Sultan's Turret in a Noose of Light.

Come, fill the Cup, and in the fire of Spring  
The Winter Garment of Repentance fling:  
The Bird of Time has but a little way  
To flutter—and the Bird is on the Wing.`
</script>

<template>
  <LandingCompareGrid
    title="Caret Indicator"
    description="Show a caret indicator while streaming content."
    :markdown="markdown"
    :comark-props="{ caret: true }"
  />
</template>
