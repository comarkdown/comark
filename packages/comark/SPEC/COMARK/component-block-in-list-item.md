## Input

```md
- *item one*
  ::block
  #body
  ### Heading
  ::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ul",
      {},
      [
        "li",
        {},
        [
          "p",
          {},
          [
            "em",
            {},
            "item one"
          ]
        ],
        [
          "block",
          {},
          [
            "template",
            {
              "name": "body"
            },
            [
              "h3",
              {
                "id": "heading"
              },
              "Heading"
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
<ul>
  <li>
    <p><em>item one</em></p>
    <block>
      <template name="body">
        <h3 id="heading">Heading</h3>
      </template>
    </block>
  </li>
</ul>
```

## Markdown

```md
- *item one*
  ::block
  #body
  ### Heading
  ::
```
