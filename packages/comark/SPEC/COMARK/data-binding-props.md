## Input

```md
::card{title="Hello" variant="primary"}
:::badge{:label="props.title" :color="props.variant"}
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
      {
        "title": "Hello",
        "variant": "primary"
      },
      [
        "badge",
        {
          ":label": "props.title",
          ":color": "props.variant"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<card title="Hello" variant="primary">
  <badge label="Hello" color="primary"></badge>
</card>
```

## Markdown

```md
::card{title="Hello" variant="primary"}
  :::badge{:label="props.title" :color="props.variant"}
  :::
::
```
