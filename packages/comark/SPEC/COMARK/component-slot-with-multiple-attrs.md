## Input

```md
::comp
#header{unwrap="p" preset="title"}
Title
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "comp",
      {},
      [
        "template",
        {
          "name": "header",
          "unwrap": "p",
          "preset": "title"
        },
        "Title"
      ]
    ]
  ]
}
```

## HTML

```html
<comp>
  <template name="header" unwrap="p" preset="title">
    Title
  </template>
</comp>
```

## Markdown

```md
::comp
#header{unwrap="p" preset="title"}
Title
::
```
