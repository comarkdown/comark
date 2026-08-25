## Input

```md
::component
---
attr: value
object-attr:
  key1: value1
  key2: value2
array:
  - item 1
  - item 2
---
First Paragraph

Second Paragraph
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
      {
        "attr": "value",
        ":object-attr": {
          "key1": "value1",
          "key2": "value2"
        },
        ":array": [
          "item 1",
          "item 2"
        ]
      },
      [
        "p",
        {},
        "First Paragraph"
      ],
      [
        "p",
        {},
        "Second Paragraph"
      ]
    ]
  ]
}
```

## HTML

```html
<component attr="value" object-attr="{&quot;key1&quot;:&quot;value1&quot;,&quot;key2&quot;:&quot;value2&quot;}" array="[&quot;item 1&quot;,&quot;item 2&quot;]">
  <p>First Paragraph</p>
  <p>Second Paragraph</p>
</component>
```

## Markdown

```md
::component
```yaml [props]
attr: value
object-attr:
  key1: value1
  key2: value2
array:
  - item 1
  - item 2
```
First Paragraph

Second Paragraph
::
```
