---
timeout:
  parse: 500ms
  html: 5ms
  markdown: 5ms
options:
  highlight:
    themes:
      light: 'github-dark'
    preStyles: true
---

## Input

```md
```
Plain text code block
No language specified
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
        "class": "shiki shiki-themes github-dark dark:github-dark",
        "tabindex": "0",
        "style": "background-color:#24292e;color:#e1e4e8"
      },
      [
        "code",
        {},
        [
          "span",
          {
            "class": "line"
          },
          [
            "span",
            {},
            "Plain text code block"
          ]
        ],
        [
          "span",
          {
            "class": "line"
          },
          [
            "span",
            {},
            "No language specified"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<pre class="shiki shiki-themes github-dark dark:github-dark" tabindex="0" style="background-color:#24292e;color:#e1e4e8"><code><span class="line"><span>Plain text code block</span></span><span class="line"><span>No language specified</span></span></code></pre>
```

## Markdown

```md
```
Plain text code block
No language specified
```
```
