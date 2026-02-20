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
        "class": "shiki github-dark",
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
          "Plain text code block"
        ],
        "\n",
        [
          "span",
          {
            "class": "line"
          },
          "No language specified"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<pre class="shiki github-dark" tabindex="0" style="background-color:#24292e;color:#e1e4e8"><code><span class="line">Plain text code block</span>
<span class="line">No language specified</span></code></pre>
```

## Markdown

```md
```
Plain text code block
No language specified
```
```
