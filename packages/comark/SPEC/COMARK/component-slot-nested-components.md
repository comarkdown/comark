## Input

```md
::component
#description
Some text

:::child
Nested content
:::

:::child
More nested content
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
      "component",
      {},
      [
        "template",
        {
          "name": "description"
        },
        [
          "p",
          {},
          "Some text"
        ],
        [
          "child",
          {},
          "Nested content"
        ],
        [
          "child",
          {},
          "More nested content"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <template name="description">
    <p>Some text</p>
    <child>
      Nested content
    </child>
    <child>
      More nested content
    </child>
  </template>
</component>
```

## Markdown

```md
::component
#description
Some text

  :::child
  Nested content
  :::

  :::child
  More nested content
  :::
::
```
