<template>
  <div>
    <UCard>
      <span>header</span>
      <div>
        <slot name="header" />
      </div>
    </UCard>
    <UCard>
      <span>default</span>
      <div>
        <slot />
      </div>
    </UCard>
    <UCard>
      <span>footer</span>
      <div>
        <slot name="footer" />
      </div>
    </UCard>
  </div>
</template>
