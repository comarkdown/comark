import { ComarkClient } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'
import 'katex/dist/katex.min.css'

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

export default function App() {
  return (
    <main className="max-w-2xl mx-auto prose">
      <ComarkClient
        markdown={markdown}
        components={{ Math }}
        plugins={[math()]}
      />
    </main>
  )
}
