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
        "language": "markdown",
        "filename": "content.md",
        "class": "shiki shiki-themes github-dark dark:github-dark",
        "tabindex": "0",
        "style": "background-color:#24292e;color:#e1e4e8"
      },
      [
        "code",
        {
          "class": "language-markdown"
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
              "style": "color:#79B8FF;--shiki-light-font-weight:bold"
            },
            "# My Page Title"
          ]
        ],
        "\n",
        [
          "span",
          {
            "class": "line",
            "style": "display: inline"
          }
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
              "style": "color:#E1E4E8"
            },
            "This is the opening paragraph used as the description."
          ]
        ],
        "\n",
        [
          "span",
          {
            "class": "line",
            "style": "display: inline"
          }
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
              "style": "color:#79B8FF;--shiki-light-font-weight:bold"
            },
            "## Section One"
          ]
        ],
        "\n",
        [
          "span",
          {
            "class": "line",
            "style": "display: inline"
          }
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
<pre language="markdown" filename="content.md" class="shiki shiki-themes github-dark dark:github-dark" tabindex="0" style="background-color:#24292e;color:#e1e4e8"><code class="language-markdown"><span class="line" style="display: inline"><span style="color:#79B8FF;--shiki-light-font-weight:bold"># My Page Title</span></span>
<span class="line" style="display: inline"></span>
<span class="line" style="display: inline"><span style="color:#E1E4E8">This is the opening paragraph used as the description.</span></span>
<span class="line" style="display: inline"></span>
<span class="line" style="display: inline"><span style="color:#79B8FF;--shiki-light-font-weight:bold">## Section One</span></span>
<span class="line" style="display: inline"></span>
<span class="line" style="display: inline"><span style="color:#E1E4E8">More content here.</span></span></code></pre>
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
