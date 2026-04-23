export const airbnbMarkdown = `---
title: Secluded Log Cabin in the Forest
description: A nature retreat powered by Comark
---

::PropertyGallery
#main
![Log cabin surrounded by pine trees](https://picsum.photos/seed/woods/800/500)

#thumbnails
![Misty lake at sunrise](https://picsum.photos/seed/mountain/400/300)

![Cozy bedroom with wooden beams](https://picsum.photos/id/1045/400/300)

![Stone fireplace and lounge area](https://picsum.photos/id/48/400/300)

![Private deck overlooking the forest](https://picsum.photos/seed/cabin/400/300)
::

# Amazing Cabin in the Forest

Entire cabin · 4 guests · 2 bedrooms · 2 beds · 1 bath

::RatingBar{rating="4.97" reviews="86"}
::

\`\`\`json-render
{
  "type": "HostInfo",
  "props": {
    "name": "Thomas",
    "badge": "Superhost",
    "duration": "5 years hosting"
  }
}
\`\`\`

::Facility{icon="i-lucide-flame"}
#title
Wood-burning fireplace

#description
Nothing beats an evening by the fire after a day of hiking in the surrounding trails.
::

::Facility{icon="i-lucide-trees"}
#title
Direct trail access

#description
Step straight onto marked hiking and mountain bike trails from the cabin's back door.
::

::Facility{icon="i-lucide-star"}
#title
Truly off-grid feel

#description
Peaceful, no neighbours in sight — just birdsong, deer, and open sky.
::

---

::TwoColumn
#left

Tucked deep in a **pine and oak forest**, this hand-built log cabin sits beside a private stream at the edge of a national park. Every window frames a different stretch of wilderness.

Wake up to *mist rolling through the treetops*, brew coffee on the wraparound deck, and spend the day exploring — or do absolutely nothing at all.

### What's included

- [x] Wood-burning fireplace & stacked logs
- [x] Fully equipped rustic kitchen
- [x] Fresh linen & wool blankets
- [x] Private deck with outdoor furniture
- [x] BBQ grill & fire pit
- [ ] WiFi (basic signal only)
- [ ] Pets allowed (ask host)

### House Rules

| Rule | Details |
| ---- | ------- |
| Check-in | After 4:00 PM |
| Checkout | Before 10:00 AM |
| Max guests | 4 |
| Smoking | Outdoors only |
| Fires | Fire pit use only |

### Getting Around

The cabin is reached via a **5 km unpaved forest road** — a 4×4 or high-clearance vehicle is recommended in winter. The nearest village with shops is [15 minutes by car](#).

:::callout{color="warning" icon="i-lucide-triangle-alert"}
Mobile signal is unreliable past the village. Download offline maps before you arrive.
:::

> [!TIP]
> Thomas leaves a printed guide with the best swimming spots, sunrise viewpoints, and local forager trails.

#right

:::BookingCard{title="Add dates for prices" cta="Check availability"}
:::

::
`

// ─── Comark Parser State ───
export const allFeaturesMarkdown = `---
title: Hello Comark
description: A Comark playground
---

# Hello Comark

This is a **Comark** playground inside DevTools.

Write Markdown with component syntax and see the parsed AST in real-time.

## Features

- **Bold** and *italic* text
- [Links](https://github.com/comarkdown/comark)
- Lists and task lists

### Task List

- [x] Parse markdown
- [x] Generate AST
- [ ] Render components

### Component Syntax

::callout{color="info" icon="i-lucide-info"}
This is a Comark component using MDC syntax.
::

### Github Alert

> [!WARNING]
> This is a warning alert.

### Math

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

### Mermaid

\`\`\`mermaid {height="200px"}
graph TD
A[Start] --> B[Stop]
\`\`\`

### Code Block

\`\`\`ts [example.ts]
import { parse } from 'comark'

const tree = await parse('# Hello World')
console.log(tree.nodes)
\`\`\`

### Table

| Feature   | Status |
| --------- | ------ |
| Parsing   | ✅      |
| Streaming | ✅      |
| Vue       | ✅      |
| React     | ✅      |

### JSON Render

\`\`\`json-render
{
  "root": "card-1",
  "elements": {
    "card-1": {
      "type": "Card",
      "props": { "title": "Welcome" },
      "children": ["text-1"]
    },
    "text-1": {
      "type": "Text",
      "props": { "content": "This is Json Render inside Comark" },
      "children": []
    }
  }
}
\`\`\`

### Footnotes

Comark supports footnotes[^1] with automatic numbering and back-references[^2].

[^1]: Footnotes are collected and rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link (↩) to jump back to the reference.
`

export const playgroundExamples: { label: string, value: string, content: string }[] = [
  { label: 'Airbnb', value: 'airbnb', content: airbnbMarkdown },
  { label: 'All Features', value: 'all-features', content: allFeaturesMarkdown },
]

export const defaultMarkdown = airbnbMarkdown
