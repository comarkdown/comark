export const bookingMarkdown = `---
title: Amazing Cabin in the Forest
description: A nature retreat powered by Comark
page:
  "#comment": The "page" field is custom field and exists only for demonstration, it is no part of Comark core
  maxWidth: 1120px
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

# {{ frontmatter.title }}

Entire cabin · 4 guests · 2 bedrooms · 2 beds · 1 bath

::RatingBar{rating="3.75" reviews="86"}
#title
Guest favorite

#description
One of the most loved homes to book, according to guests
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

export const allFeaturesMarkdown = `---
title: Hello Comark
description: A Comark playground
page:
  "#comment": The "page" field is custom field and exists only for demonstration, it is no part of Comark core
  maxWidth: 1120px
---

# Comark Playground

Write Markdown with component syntax and see the preview and parsed AST in real-time.

## Features

- **Bold** and *italic* text
- [Links](https://github.com/comarkdown/comark)
- Lists and task lists

### Task List

- [x] Parse markdown
- [x] Generate AST
- [ ] Render components

### Component Syntax

::callout{color="success" icon="i-lucide-lightbulb"}
This is a Vue component using the Markdown components syntax.
::

::card{icon="i-lucide-rocket" color="primary"}
#title
Another component
#default
With 2 slots, title and default.
::

You can use all the [Nuxt UI Typography components](https://ui.nuxt.com/docs/typography/accordion){target="_blank"} in this playground.

### Github Alert

> [!NOTE]
> This is a note callout.

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
page:
  "#comment": The "page" field is custom field and exists only for demonstration, it is no part of Comark core
  maxWidth: 1120px
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

export const nuxtUiMarkdown = `---
title: Observe less. Understand more.
description: Map your entire system in real-time, surface anomalies before they cascade, and eliminate the dashboards you never needed.
page:
  "#comment": The "page" field is custom field and exists only for demonstration, it is no part of Comark core
  maxWidth: 1120px
---

::PageHero
#headline
:::badge
v2.0 — Now with predictive alerting
:::

#title
Observe less. **Understand more.**

#description
Map your entire system in real-time, surface anomalies before they cascade, and eliminate the dashboards you never needed.

#links
  :::Button{color="primary" size="xl" to="#"}
  Start for free
  :::

  :::Button{color="neutral" variant="soft" size="xl" to="#"}
  View demo
  :::
::

::PageSection
#title
Every signal, one surface.

#description
No more tab-switching between metrics, traces, and logs. Correlate everything into a single explorable topology.

#features
  :::PageCard{icon="i-lucide-zap" to="#"}
  #title
  Predictive Alerts

  #description
  ML models trained on your baselines detect anomalies 4 minutes before they hit your SLOs.
  :::

  :::PageCard{icon="i-lucide-radar" to="#"}
  #title
  Topology Mapping

  #description
  Auto-discovers service dependencies with zero config. See how a deploy in auth-service ripples through checkout.
  :::

  :::PageCard{icon="i-lucide-layers" to="#"}
  #title
  Unified Telemetry

  #description
  Logs, metrics, and traces in one query language. Stop context-switching. Start correlating.
  :::

  :::PageCard{icon="i-lucide-git-commit-horizontal" to="#"}
  #title
  Deploy Tracking

  #description
  Every deploy is automatically correlated with performance changes. Know which commit caused the regression.
  :::

  :::PageCard{icon="i-lucide-filter" to="#"}
  #title
  Smart Sampling

  #description
  AI-driven sampling retains interesting traces and drops noise. Cut storage costs 10× without losing signal.
  :::

  :::PageCard{icon="i-lucide-notebook-pen" to="#"}
  #title
  Team Notebooks

  #description
  Collaborative investigation notebooks that turn incident debugging into reusable runbooks.
  :::
::

::PageSection
#title
Built for scale you haven't hit yet.

#description
Process billions of events per day across thousands of production environments with an architecture designed for the workloads of 2030.

#features
  :::PageCard{to="#"}
  #title
  99.99%

  #description
  Uptime SLA
  :::

  :::PageCard{to="#"}
  #title
  50ms P99

  #description
  Median query latency
  :::

  :::PageCard{to="#"}
  #title
  14B+

  #description
  Events / day
  :::
::

::PageSection
#title
Ready to stop firefighting?

#description
Free for up to 5 services. No credit card. Deploys in under a minute.

#links
  :::Button{color="primary" size="xl" to="#"}
  Start for free
  :::

  :::Button{color="neutral" variant="outline" size="xl" trailing-icon="i-lucide-book-open" to="#"}
  Read the documentation
  :::
::
`

export type AiMode = 'showcase' | 'nuxt-ui'

export type PlaygroundExample = {
  label: string
  value: string
  content: string
  mode?: AiMode
  prompt?: string
  to?: string
}

export const playgroundExamples: PlaygroundExample[] = [
  {
    label: 'Booking',
    value: 'booking',
    content: bookingMarkdown,
    mode: 'showcase',
    prompt: 'A beachfront villa in Malibu with ocean views.',
  },
  {
    label: 'Recipe',
    value: 'recipe',
    content: recipeMarkdown,
    mode: 'showcase',
    prompt: "My grandmother's secret tiramisu recipe.",
  },
  {
    label: 'Nuxt UI',
    value: 'nuxt-ui',
    content: nuxtUiMarkdown,
    mode: 'nuxt-ui',
    prompt: 'Landing page for a mountain bike rental in the Alps.',
  },
  {
    label: 'All Features',
    value: 'all-features',
    to: '/play/editor?example=all-features',
    content: allFeaturesMarkdown,
  },
]

export const defaultMarkdown = bookingMarkdown
