<script setup lang="ts">
const markdown = `## Linear Algebra and Calculus

In linear algebra, a system of equations can be written compactly as $$A\\mathbf{x} = \\mathbf{b}$$, where $$A \\in \\mathbb{R}^{m \\times n}$$ is a matrix and $$\\mathbf{x} \\in \\mathbb{R}^n$$ is a vector of unknowns.

The determinant $$\\det(A)$$ tells us whether the system has a unique solution: if $$\\det(A) \\neq 0$$, then $$A^{-1}$$ exists and $$\\mathbf{x} = A^{-1}\\mathbf{b}$$.

## Block Math

The gradient of a scalar-valued function $$f(x, y)$$ is given by:

$$
\\nabla f =
\\begin{bmatrix}
\\frac{\\partial f}{\\partial x} \\\\
\\frac{\\partial f}{\\partial y}
\\end{bmatrix}
$$

## Series and Limits

A geometric series converges when $$|r| < 1$$:

$$
\\sum_{k=0}^{\\infty} ar^k = \\frac{a}{1 - r}
$$

The definition of a limit uses $$\\varepsilon$$–$$\\delta$$ notation:

$$
\\lim_{x \\to c} f(x) = L \\quad \\text{if for every } \\varepsilon > 0 \\text{ there exists } \\delta > 0
$$

`
</script>

<template>
  <LandingCompareGrid
    title="Math Support for Comark"
    description="Comark supports math support out of the box, so you get things like inline and block math, even with complex math expressions."
    :markdown="markdown"
  />
</template>
