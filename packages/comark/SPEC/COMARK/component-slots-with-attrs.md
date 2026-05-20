## Input

```md
::feature
#title{unwrap="p"}
Visual Editor

#description{unwrap="p"}
Edit without code.
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "feature",
      {},
      [
        "template",
        {
          "name": "title",
          "unwrap": "p"
        },
        "Visual Editor"
      ],
      [
        "template",
        {
          "name": "description",
          "unwrap": "p"
        },
        "Edit without code."
      ]
    ]
  ]
}
```

## HTML

```html
<feature>
  <template name="title" unwrap="p">
    Visual Editor
  </template>
  <template name="description" unwrap="p">
    Edit without code.
  </template>
</feature>
```

## Markdown

```md
::feature
#title{unwrap="p"}
Visual Editor

#description{unwrap="p"}
Edit without code.
::
```
