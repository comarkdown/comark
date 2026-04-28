## Input

```md
- Level 1
  - Level 2
    - Level 3 with code:

        ```py
        print("deep")
        ```
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
          "Level 1"
        ],
        [
          "ul",
          {},
          [
            "li",
            {},
            [
              "p",
              {},
              "Level 2"
            ],
            [
              "ul",
              {},
              [
                "li",
                {},
                [
                  "p",
                  {},
                  "Level 3 with code:"
                ],
                [
                  "pre",
                  {
                    "language": "py"
                  },
                  [
                    "code",
                    {
                      "class": "language-py"
                    },
                    "print(\"deep\")"
                  ]
                ]
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
<ul>
  <li>
    <p>Level 1</p>
    <ul>
      <li>
        <p>Level 2</p>
        <ul>
          <li>
            <p>Level 3 with code:</p>
            <pre language="py"><code class="language-py">print("deep")</code></pre>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```

## Markdown

```md
- Level 1
  - Level 2
    - Level 3 with code:
      ```py
      print("deep")
      ```
```
