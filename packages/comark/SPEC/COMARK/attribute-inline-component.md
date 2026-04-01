## Input

```md
Here :in{bool} :in{#id1} :in{.class1} :in{attr="value"}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "Here ",
      [
        "in",
        {
          ":bool": "true"
        }
      ],
      " ",
      [
        "in",
        {
          "id": "id1"
        }
      ],
      " ",
      [
        "in",
        {
          "class": "class1"
        }
      ],
      " ",
      [
        "in",
        {
          "attr": "value"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  Here <in bool></in> <in id="id1"></in> <in class="class1"></in> <in attr="value"></in>
</p>
```

## Markdown

```md
Here :in{bool} :in{#id1} :in{.class1} :in{attr="value"}
```
