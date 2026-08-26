## Input

```md
Here ~~del~~{bool} ~~del~~{#id1} ~~del~~{.class1} ~~del~~{attr="value"} ~~`x`~~{.gone} ~~*x*~~{.gone}
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
        "del",
        {
          ":bool": "true"
        },
        "del"
      ],
      " ",
      [
        "del",
        {
          "id": "id1"
        },
        "del"
      ],
      " ",
      [
        "del",
        {
          "class": "class1"
        },
        "del"
      ],
      " ",
      [
        "del",
        {
          "attr": "value"
        },
        "del"
      ],
      " ",
      [
        "del",
        {
          "class": "gone"
        },
        [
          "code",
          {},
          "x"
        ]
      ],
      " ",
      [
        "del",
        {
          "class": "gone"
        },
        [
          "em",
          {},
          "x"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p>Here <del bool>del</del> <del id="id1">del</del> <del class="class1">del</del> <del attr="value">del</del> <del class="gone"><code>x</code></del> <del class="gone"><em>x</em></del></p>
```

## Markdown

```md
Here ~~del~~{bool} ~~del~~{#id1} ~~del~~{.class1} ~~del~~{attr="value"} ~~`x`~~{.gone} ~~*x*~~{.gone}
```
