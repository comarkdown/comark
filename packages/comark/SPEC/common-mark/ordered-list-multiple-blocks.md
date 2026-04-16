## Input

```md
1. First point:

   > A quote here

    ```js
    code()
    ```

2. Second point
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
        "First point:",
        [
          "blockquote",
          {},
          "A quote here"
        ],
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
        ]
      ],
      [
        "li",
        {},
        "Second point"
      ]
    ]
  ]
}
```

## HTML

```html
<ol>
  <li>
    First point:
    <blockquote>
      A quote here
    </blockquote>
    <pre language="js"><code class="language-js">code()</code></pre>
  </li>
  <li>Second point</li>
</ol>
```

## Markdown

```md
1. First point:
   > A quote here
   ```js
   code()
   ```
2. Second point
```
