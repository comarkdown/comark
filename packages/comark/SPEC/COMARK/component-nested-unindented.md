## Input

```md
::card
This is the parent

:::sibling
Sibling content
:::

#title
:::nested
Slot content
:::

:::nested
More slot content
:::
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "card",
      {},
      [
        "p",
        {},
        "This is the parent"
      ],
      [
        "sibling",
        {},
        "Sibling content"
      ],
      [
        "template",
        {
          "name": "title"
        },
        [
          "nested",
          {},
          "Slot content"
        ],
        [
          "nested",
          {},
          "More slot content"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<card>
  <p>This is the parent</p>
  <sibling>
    Sibling content
  </sibling>
  <template name="title">
    <nested>
      Slot content
    </nested>
    <nested>
      More slot content
    </nested>
  </template>
</card>
```

## Markdown

```md
::card
This is the parent

  :::sibling
  Sibling content
  :::

#title
  :::nested
  Slot content
  :::

  :::nested
  More slot content
  :::
::
```

## Markdown HTML

```md
<card>

This is the parent

<sibling>

Sibling content

</sibling>

<template v-slot:title="">

<nested>

Slot content

</nested>

<nested>

More slot content

</nested>

</template>

</card>
```
