## Input

```md
::component
#default
Default slot content
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
          "name": "default"
        },
        "Default slot content"
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <template name="default">
    Default slot content
  </template>
</component>
```

## Markdown

```md
::component
Default slot content
::
```
