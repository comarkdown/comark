---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
<comp1>
  ::comp2
  #title
  This is the title of `comp2` component

  #default
  In this <strong class="text-red-500">paragraph</strong>, we [mix <sub>html</sub> and _<sub>markdonw</sub>_]
  ::
</comp1>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "comp1",
      { "$": { "html": 1, "block": 1 } },
      [
        "comp2",
        {},
        [
          "template",
          { "name": "title" },
          "This is the title of ",
          [
            "code",
            {},
            "comp2"
          ],
          " component"
        ],
        [
          "template",
          {
            "name": "default"
          },
          "In this ",
          [
            "strong",
            {
              "$": {
                "block": 0,
                "html": 1
              },
              "class": "text-red-500"
            },
            "paragraph"
          ],
          ", we ",
          [
            "span",
            {},
            "mix ",
            [
              "sub",
              {
                "$": {
                  "block": 0,
                  "html": 1
                }
              },
              "html"
            ],
            " and ",
            [
              "em",
              {},
              [
                "sub",
                {
                  "$": {
                    "block": 0,
                    "html": 1
                  }
                },
                "markdonw"
              ]
            ]
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<comp1>
  <comp2>
    <template name="title">
      This is the title of <code>comp2</code> component
    </template>
    <template name="default">
      In this <strong class="text-red-500">paragraph</strong>, we <span>
        mix <sub>html</sub> and <em>
          <sub>markdonw</sub>
        </em>
      </span>
    </template>
  </comp2>
</comp1>
```

## Markdown

```md
<comp1>
  ::comp2
  #title
  This is the title of `comp2` component

  #default
  In this <strong class="text-red-500">paragraph</strong>, we [mix <sub>html</sub> and *<sub>markdonw</sub>*]
  ::
</comp1>
```
