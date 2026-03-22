---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
options:
  highlight: false
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
        "filename": "content.md",
        "language": "markdown"
      },
      [
        "code",
        {
          "class": "language-markdown"
        },
        "# My Page Title\n\nThis is the opening paragraph used as the description.\n\n## Section One\n\nMore content here."
      ]
    ]
  ]
}
```

## HTML

```html
<pre language="markdown" filename="content.md"><code class="language-markdown"># My Page Title

This is the opening paragraph used as the description.

## Section One

More content here.</code></pre>
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
