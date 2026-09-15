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
Use `Ref<T>`{lang="ts-type"} here.
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "Use ",
      [
        "code",
        {
          "lang": "ts-type",
          "class": "shiki shiki-themes github-dark dark:github-dark"
        },
        [
          "span",
          {
            "style": "color:#B392F0"
          },
          "Ref"
        ],
        [
          "span",
          {
            "style": "color:#E1E4E8"
          },
          "<"
        ],
        [
          "span",
          {
            "style": "color:#B392F0"
          },
          "T"
        ],
        [
          "span",
          {
            "style": "color:#E1E4E8"
          },
          ">"
        ]
      ],
      " here."
    ]
  ]
}
```

## HTML

```html
<p>Use <code lang="ts-type" class="shiki shiki-themes github-dark dark:github-dark"><span style="color:#B392F0">Ref</span><span style="color:#E1E4E8">&lt;</span><span style="color:#B392F0">T</span><span style="color:#E1E4E8">&gt;</span></code> here.</p>
```

## Markdown

```md
Use `Ref<T>`{lang="ts-type"} here.
```
