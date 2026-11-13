---
timeout:
  parse: 500ms
  html: 5ms
  markdown: 5ms
options:
  highlight:
    themes:
      light: 'github-dark'
    transformers:
      - 'line-class'
---

## Input

```md
```ts
const a = 1
const b = 2
```
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "pre",
      {
        "language": "ts",
        "class": "shiki shiki-themes github-dark dark:github-dark"
      },
      [
        "code",
        {
          "class": "language-ts"
        },
        [
          "span",
          {
            "class": "line added",
            "style": "display: inline"
          },
          [
            "span",
            {
              "style": "color:#F97583"
            },
            "const"
          ],
          [
            "span",
            {
              "style": "color:#79B8FF"
            },
            " a"
          ],
          [
            "span",
            {
              "style": "color:#F97583"
            },
            " ="
          ],
          [
            "span",
            {
              "style": "color:#79B8FF"
            },
            " 1"
          ]
        ],
        "\n",
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
            "const"
          ],
          [
            "span",
            {
              "style": "color:#79B8FF"
            },
            " b"
          ],
          [
            "span",
            {
              "style": "color:#F97583"
            },
            " ="
          ],
          [
            "span",
            {
              "style": "color:#79B8FF"
            },
            " 2"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<pre data-language="ts" class="shiki shiki-themes github-dark dark:github-dark"><code class="language-ts"><span class="line added" style="display: inline"><span style="color:#F97583">const</span><span style="color:#79B8FF"> a</span><span style="color:#F97583"> =</span><span style="color:#79B8FF"> 1</span></span>
<span class="line" style="display: inline"><span style="color:#F97583">const</span><span style="color:#79B8FF"> b</span><span style="color:#F97583"> =</span><span style="color:#79B8FF"> 2</span></span></code></pre>
```

## Markdown

```md
```ts
const a = 1
const b = 2
```
```
