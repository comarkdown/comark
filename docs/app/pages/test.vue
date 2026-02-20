<script setup lang="ts">
import { Comark } from 'comark/vue'
import resolveComponent from '../utils/components-manifest'

const markdown = ref(`
---
seo:
  title: Big Markdown Example — Components, Code, Lists, Tables!
  description: Showcase of Markdown, MDC components, code blocks, lists, tables, and more using Comark.
  ogImage: '/social-card.png'
---

# Comark Playground

Try out a large markdown sample mixing **all the features**!

::u-alert{type="info"}
#title
This is an info alert!  
You can put markdown **inside** MDC components.
::

---

## Table of Contents

- [Headings](#headings)
- [Alerts and Buttons](#alerts-and-buttons)
- [Code and Syntax Highlighting](#code-and-syntax-highlighting)
- [Lists & Task Lists](#lists--task-lists)
- [Tables](#tables)
- [Math](#math)
- [Custom Vue Components](#custom-vue-components)
- [Component Props](#component-props)
- [Slots Example](#slots-example)

---

## Headings

# h1  
## h2  
### h3  
#### h4  
##### h5  
###### h6  

---

## Alerts and Buttons

::alert
# Success!
Everything **worked** 🎉

::

::alert{type="warning"}
Careful: Mixing *markdown* and MDC:
- You can have lists!
::

::u-button
---
color: primary
to: /getting-started/introduction
trailing-icon: i-lucide-arrow-right
---
Get Started
::

---

## Code and Syntax Highlighting

Regular code block:

~~~js
export function greet(name) {
  return \`Hello, dsds!\`
}
~~~

Inline code: \`const x = 42\`

MDC fenced code block:

~~~vue
<template>
  <div>Hello, Vue!</div>
</template>
~~~

Code block with math:

~~~math
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
~~~

---

## Lists & Task Lists

- Bullet item 1
- Bullet item 2
  - Nested _item_  
- Bullet: **Markdown works!**
1. Numbered one
2. Numbered two

**Task list:**

- [ ] Unchecked
- [x] Checked

---

## Tables

| Feature    | Supported | Notes                    |
|------------|:---------:|--------------------------|
| Markdown   | ✅        | Full CommonMark + GFM    |
| Components | ✅        | MDC and custom Vue/React |
| Streaming  | ✅        | Real-time updates        |

---

## Math

Inline math: $E = mc^2$.

Display math:

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

---

## Custom Vue Components

::fancy-alert{level="wow" icon="i-lucide-sparkles"}
This is a **custom** Vue component in markdown!
::

::prose-pre
---
lang: typescript
---
function add(a: number, b: number): number {
  return a + b
}
::

---

## Component Props

::demo-card{title="Card with Props" :count="3" active="true"}
- Prop demo with various types
- \`count\` is passed as a number
::

---

## Slots Example

:::card
#header
# Custom header slot

#default
Main card content

#footer
**Footer slot** with [link](/)
:::

---

Thanks for trying the **Comark test page**! 🚀

`)
</script>

<template>
  <UContainer>
    <Comark
      :components-manifest="resolveComponent"
      :options="{ highlight: true }"
    >
      {{ markdown }}
    </Comark>
  </UContainer>
</template>
