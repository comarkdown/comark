<template>
  <p>
    <slot />
  </p>
</template>

<style scoped>
p {
  color: #333;
  line-height: 1.5;
}
p::first-letter {
  text-transform: capitalize;
  font-size: 20px;
  color: red;
  font-family: 'Monoton', sans-serif;
  vertical-align: middle;
}
</style>
