---
timeout:
  parse: 50ms
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
```markdown [content.md]
# My Page Title

This is the opening paragraph used as the description.

## Section One

More content here.
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
        "class": "shiki github-dark dark:github-dark",
        "filename": "content.md",
        "language": "markdown",
        "style": "background-color:#24292e;color:#e1e4e8",
        "tabindex": "0"
      },
      [
        "code",
        {
          "class": "language-markdown"
        },
        [
          "span",
          {
            "class": "line"
          },
          [
            "span",
            {
              "style": "color:#79B8FF"
            },
            "# My Page Title"
          ]
        ],
        [
          "span",
          {
            "class": "line"
          }
        ],
        [
          "span",
          {
            "class": "line"
          },
          [
            "span",
            {
              "style": "color:#E1E4E8"
            },
            "This is the opening paragraph used as the description."
          ]
        ],
        [
          "span",
          {
            "class": "line"
          }
        ],
        [
          "span",
          {
            "class": "line"
          },
          [
            "span",
            {
              "style": "color:#79B8FF"
            },
            "## Section One"
          ]
        ],
        [
          "span",
          {
            "class": "line"
          }
        ],
        [
          "span",
          {
            "class": "line"
          },
          [
            "span",
            {
              "style": "color:#E1E4E8"
            },
            "More content here."
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<pre language="markdown" filename="content.md" class="shiki github-dark dark:github-dark" tabindex="0" style="background-color:#24292e;color:#e1e4e8"><code class="language-markdown"><span class="line"><span style="color:#79B8FF"># My Page Title</span></span><span class="line"></span><span class="line"><span style="color:#E1E4E8">This is the opening paragraph used as the description.</span></span><span class="line"></span><span class="line"><span style="color:#79B8FF">## Section One</span></span><span class="line"></span><span class="line"><span style="color:#E1E4E8">More content here.</span></span></code></pre>
```

## Markdown

```md
```markdown [content.md]
# My Page Title

This is the opening paragraph used as the description.

## Section One

More content here.
```
```
