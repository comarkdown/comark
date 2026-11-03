## Input

```md
::card
#title
Getting started

#content
- **Node.js** - `22.x` or newer
- **Terminal** - In order to run Nuxt commands

:::callout
Make sure to use an even numbered version.
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
      {},
      [
        "template",
        {
          "name": "title"
        },
        "Getting started"
      ],
      [
        "template",
        {
          "name": "content"
        },
        [
          "ul",
          {},
          [
            "li",
            {},
            [
              "strong",
              {},
              "Node.js"
            ],
            " - ",
            [
              "code",
              {},
              "22.x"
            ],
            " or newer"
          ],
          [
            "li",
            {},
            [
              "strong",
              {},
              "Terminal"
            ],
            " - In order to run Nuxt commands"
          ]
        ],
        [
          "callout",
          {},
          "Make sure to use an even numbered version."
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<card>
  <template name="title">
    Getting started
  </template>
  <template name="content">
    <ul>
      <li><strong>Node.js</strong> - <code>22.x</code> or newer</li>
      <li><strong>Terminal</strong> - In order to run Nuxt commands</li>
    </ul>
    <callout>
      Make sure to use an even numbered version.
    </callout>
  </template>
</card>
```

## Markdown

```md
::card
#title
Getting started

#content
- **Node.js** - `22.x` or newer
- **Terminal** - In order to run Nuxt commands

:::callout
Make sure to use an even numbered version.
:::
::
```
