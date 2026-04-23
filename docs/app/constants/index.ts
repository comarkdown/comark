export const airbnbMarkdown = `---
title: Secluded Log Cabin in the Forest
description: A nature retreat powered by Comark
---

::Gallery
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

::RatingBar{rating="3.75" reviews="86"}
#title
Guest favorite

#description
One of the most loved homes on Airbnb, according to guests
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

export const recipeMarkdown = `---
title: Gratin Dauphinois
description: A classic French comfort dish powered by Comark
---

::Gallery{cover}
![Golden gratin dauphinois bubbling in a casserole](https://images.unsplash.com/photo-1684950888991-224571bf3910?w=800&h=400&fit=crop&q=80)
::

# Gratin Dauphinois

::RatingBar{rating="4.5" reviews="255"}
#title
Community favourite

#description
One of the most loved recipes, according to our cooks
::

\`\`\`json-render
{
  "type": "Ingredients",
  "props": {
    "title": "Ingredients",
    "servings": 6,
    "items": [
      { "image": "https://images.unsplash.com/photo-1637194502327-c99c94943680?w=100&h=100&fit=crop&q=80", "quantity": "500 ml", "name": "heavy cream" },
      { "image": "https://images.unsplash.com/photo-1649951806971-ad0e00408773?w=100&h=100&fit=crop&q=80", "quantity": "to taste", "name": "black pepper" },
      { "image": "https://images.unsplash.com/photo-1634612831148-03a8550e1d52?w=100&h=100&fit=crop&q=80", "quantity": "to taste", "name": "salt" },
      { "image": "https://images.unsplash.com/photo-1669358840030-599d4f9aae36?w=100&h=100&fit=crop&q=80", "quantity": "pinch", "name": "nutmeg" },
      { "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&h=100&fit=crop&q=80", "quantity": "1 kg", "name": "waxy potatoes" },
      { "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&q=80", "quantity": "50 cl", "name": "whole milk" },
      { "image": "https://images.unsplash.com/photo-1503097325940-ae094fdb97ba?w=100&h=100&fit=crop&q=80", "quantity": "1 clove", "name": "garlic" },
      { "image": "https://images.unsplash.com/photo-1587185717368-4d92f8de4ad2?w=100&h=100&fit=crop&q=80", "quantity": "knob", "name": "butter" }
    ]
  }
}
\`\`\`

::steps{level="4"}

#### Preheat the oven

Preheat your oven to 200 °C (400 °F, gas mark 6).

#### Make the cream mixture

Combine the cream, milk, garlic clove, nutmeg, salt and pepper in a saucepan. Warm over medium heat until it just begins to simmer, then remove from heat and discard the garlic.

#### Slice the potatoes

Peel the potatoes and slice them very thinly — about 2 mm — using a mandoline or sharp knife.

#### Layer the dish

Rub a gratin dish generously with butter. Arrange a layer of potato slices, season lightly with salt, then repeat until all the potatoes are used.

#### Add the cream

Pour the warm cream mixture evenly over the potatoes. The liquid should nearly reach the top layer.

#### Bake

Bake for 45 minutes until the top is deep golden and a knife passes through the potatoes with no resistance.

#### Rest before serving

Rest for 10 minutes before serving — the gratin firms up and the flavours settle.

::

:::callout{color="warning" icon="i-lucide-triangle-alert"}
Slice the potatoes directly into the dish — rinsing them washes away the starch that thickens the sauce.
:::

> [!TIP]
> For extra richness, replace 100 ml of milk with an equal amount of crème fraîche.
`

export const playgroundExamples: { label: string, value: string, content: string }[] = [
  { label: 'Airbnb', value: 'airbnb', content: airbnbMarkdown },
  { label: 'Recipe', value: 'recipe', content: recipeMarkdown },
  { label: 'All Features', value: 'all-features', content: allFeaturesMarkdown },
]

export const defaultMarkdown = airbnbMarkdown
