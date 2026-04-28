## Input

```md
1. First level
   1. Second level with code:

       ```rust
       let x = 42;
       ```
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
        [
          "p",
          {},
          "First level"
        ],
        [
          "ol",
          {},
          [
            "li",
            {},
            [
              "p",
              {},
              "Second level with code:"
            ],
            [
              "pre",
              {
                "language": "rust"
              },
              [
                "code",
                {
                  "class": "language-rust"
                },
                "let x = 42;"
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
    <p>First level</p>
    <ol>
      <li>
        <p>Second level with code:</p>
        <pre language="rust"><code class="language-rust">let x = 42;</code></pre>
      </li>
    </ol>
  </li>
</ol>
```

## Markdown

```md
1. First level
   1. Second level with code:
      ```rust
      let x = 42;
      ```
```
