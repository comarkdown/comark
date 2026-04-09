## Input

```md
:span[hello]{#greeting}

:span[world]{.highlight}

:span[styled]{#main .primary .bold}

::: section{#intro .hero}
Welcome to the site.
:::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "span",
      {
        "id": "greeting"
      },
      "hello"
    ],
    [
      "span",
      {
        "class": "highlight"
      },
      "world"
    ],
    [
      "span",
      {
        "id": "main",
        "class": "primary bold"
      },
      "styled"
    ],
    [
      "section",
      {
        "id": "intro",
        "class": "hero"
      },
      "Welcome to the site."
    ]
  ]
}
```

## HTML

```html
<span id="greeting">hello</span>
<span class="highlight">world</span>
<span id="main" class="primary bold">styled</span>
<section id="intro" class="hero">
  Welcome to the site.
</section>
```

## Markdown

```md
[hello]{#greeting}

[world]{.highlight}

[styled]{#main .primary.bold}

::section{#intro .hero}
Welcome to the site.
::
```
