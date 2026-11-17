## Input

```md
::box
#default
\# literal
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "box",
      {},
      [
        "template",
        {
          "name": "default"
        },
        "# literal"
      ]
    ]
  ]
}
```

## HTML

```html
<box>
  <template name="default">
    # literal
  </template>
</box>
```

## Markdown

```md
::box
\# literal
::
```

## Markdown HTML

```md
<box>

\# literal

</box>
```
