<script setup lang="ts">
import { Comark } from 'comark/vue'
import math from '@comark/math'
import { Math } from '@comark/math/vue'

const markdown = `
# Math Formula Examples

## Inline Math

The famous equation $E = mc^2$ relates energy and mass.

The Pythagorean theorem states that $a^2 + b^2 = c^2$.

## Display Math

The quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Complex Formulas

The integral:

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

Summation:

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

Matrix:

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$
`
</script>

<template>
  <Suspense>
    <Comark
      :components="{ math: Math }"
      :options="{ plugins: [math()] }"
    >
      {{ markdown }}
    </Comark>
  </Suspense>
</template>
