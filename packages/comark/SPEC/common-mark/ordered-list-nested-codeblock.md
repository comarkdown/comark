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
        "First level",
        [
          "ol",
          {},
          [
            "li",
            {},
            "Second level with code:",
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
    First level
    <ol>
      <li>
        Second level with code:<pre language="rust"><code class="language-rust">let x = 42;</code></pre>
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
