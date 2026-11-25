## Input

```md
a {b c

x **y** {b c d

# Title {.red

- item {#id
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
      "a {b c"
    ],
    [
      "p",
      {},
      "x ",
      [
        "strong",
        {},
        "y"
      ],
      " {b c d"
    ],
    [
      "h1",
      {
        "id": "title-red"
      },
      "Title {.red"
    ],
    [
      "ul",
      {},
      [
        "li",
        {},
        "item {#id"
      ]
    ]
  ]
}
```

## HTML

```html
<p>a {b c</p>
<p>x <strong>y</strong> {b c d</p>
<h1 id="title-red">Title {.red</h1>
<ul>
  <li>item {#id</li>
</ul>
```

## Markdown

```md
a \{b c

x **y** \{b c d

# Title \{.red

- item \{#id
```
