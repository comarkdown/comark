## Input

```md
::steps
### Prerequisites

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
      "steps",
      {},
      [
        "h3",
        {
          "id": "prerequisites"
        },
        "Prerequisites"
      ],
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
}
```

## HTML

```html
<steps>
  <h3 id="prerequisites">Prerequisites</h3>
  <ul>
    <li><strong>Node.js</strong> - <code>22.x</code> or newer</li>
    <li><strong>Terminal</strong> - In order to run Nuxt commands</li>
  </ul>
  <callout>
    Make sure to use an even numbered version.
  </callout>
</steps>
```

## Markdown

```md
::steps
### Prerequisites

- **Node.js** - `22.x` or newer
- **Terminal** - In order to run Nuxt commands

:::callout
Make sure to use an even numbered version.
:::
::
```
