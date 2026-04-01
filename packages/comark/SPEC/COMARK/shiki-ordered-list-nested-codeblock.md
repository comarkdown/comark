---
timeout:
  parse: 500ms
  html: 5ms
  markdown: 5ms
options:
  highlight:
    themes:
      light: 'github-dark'
---

## Input

```md
1. Setup:

    ```rust
    let x = 1;
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
        "Setup:",
        [
          "pre",
          {
            "language": "rust",
            "class": "shiki shiki-themes github-dark dark:github-dark",
            "tabindex": "0"
          },
          [
            "code",
            {
              "class": "language-rust"
            },
            [
              "span",
              {
                "class": "line",
                "style": "display: inline"
              },
              [
                "span",
                {
                  "style": "color:#F97583"
                },
                "let"
              ],
              [
                "span",
                {
                  "style": "color:#E1E4E8"
                },
                " x "
              ],
              [
                "span",
                {
                  "style": "color:#F97583"
                },
                "="
              ],
              [
                "span",
                {
                  "style": "color:#79B8FF"
                },
                " 1"
              ],
              [
                "span",
                {
                  "style": "color:#E1E4E8"
                },
                ";"
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
    Setup:<pre language="rust" class="shiki shiki-themes github-dark dark:github-dark" tabindex="0"><code class="language-rust"><span class="line" style="display: inline"><span style="color:#F97583">let</span><span style="color:#E1E4E8"> x </span><span style="color:#F97583">=</span><span style="color:#79B8FF"> 1</span><span style="color:#E1E4E8">;</span></span></code></pre>
  </li>
</ol>
```

## Markdown

```md
1. Setup:```rust
let x = 1;
```
```
