## Input

```md
1. Complex item:

    ```js
    code()
    ```

   > A note

   - Nested with table:

     | X   | Y   |
     |-----|-----|
     | 1   | 2   |
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ol",
      {},
      [
        "li",
        {},
        "Complex item:",
        [
          "pre",
          {
            "language": "js"
          },
          [
            "code",
            {
              "class": "language-js"
            },
            "code()"
          ]
        ],
        [
          "blockquote",
          {},
          "A note"
        ],
        [
          "ul",
          {},
          [
            "li",
            {},
            "Nested with table:",
            [
              "table",
              {},
              [
                "thead",
                {},
                [
                  "tr",
                  {},
                  [
                    "th",
                    {},
                    "X"
                  ],
                  [
                    "th",
                    {},
                    "Y"
                  ]
                ]
              ],
              [
                "tbody",
                {},
                [
                  "tr",
                  {},
                  [
                    "td",
                    {},
                    "1"
                  ],
                  [
                    "td",
                    {},
                    "2"
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
<ol>
  <li>
    Complex item:<pre language="js"><code class="language-js">code()</code></pre>
    <blockquote>
      A note
    </blockquote>
    <ul>
      <li>
        Nested with table:
        <table>
          <thead>
            <tr>
              <th>X</th>
              <th>Y</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>2</td>
            </tr>
          </tbody>
        </table>
      </li>
    </ul>
  </li>
</ol>
```

## Markdown

```md
1. Complex item:
   ```js
   code()
   ```
   > A note

   - Nested with table:
     | X   | Y   |
     | --- | --- |
     | 1   | 2   |
```
