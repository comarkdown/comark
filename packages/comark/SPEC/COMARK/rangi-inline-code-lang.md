---
timeout:
  parse: 500ms
  html: 5ms
  markdown: 5ms
options:
  plugins:
    - rangi
---

## Input

```md
Use `const a = 1`{lang="ts"} here.
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
          "lang": "ts",
          "class": "shj shiki shj-lang-ts"
        },
        [
          "span",
          {
            "class": "shj-syn-kwd shj-kwd",
            "style": "color:#e16;--shiki-dark:#ff7cc6"
          },
          "const"
        ],
        " a ",
        [
          "span",
          {
            "class": "shj-syn-oper shj-oper",
            "style": "color:#5af;--shiki-dark:#80c6ff"
          },
          "="
        ],
        " ",
        [
          "span",
          {
            "class": "shj-syn-num shj-num",
            "style": "color:#f60;--shiki-dark:#b581fd"
          },
          "1"
        ]
      ],
      " here."
    ]
  ]
}
```

## HTML

```html
<p>Use <code lang="ts" class="shj shiki shj-lang-ts"><span class="shj-syn-kwd shj-kwd" style="color:#e16;--shiki-dark:#ff7cc6">const</span> a <span class="shj-syn-oper shj-oper" style="color:#5af;--shiki-dark:#80c6ff">=</span> <span class="shj-syn-num shj-num" style="color:#f60;--shiki-dark:#b581fd">1</span></code> here.</p>
```

## Markdown

```md
Use `const a = 1`{lang="ts"} here.
```
