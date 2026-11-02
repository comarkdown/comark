## Input

```md
The function will receive an object ({ isDev, isServer, isClient, isModern, isLegacy }).

Call `useFetch` like foo({ query: { page } }).

Escaped \({ a, b }) and {\# heading} stay text.
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
      "The function will receive an object ({ isDev, isServer, isClient, isModern, isLegacy })."
    ],
    [
      "p",
      {},
      "Call ",
      [
        "code",
        {},
        "useFetch"
      ],
      " like foo({ query: { page } })."
    ],
    [
      "p",
      {},
      "Escaped ({ a, b }) and {# heading} stay text."
    ]
  ]
}
```

## HTML

```html
<p>The function will receive an object ({ isDev, isServer, isClient, isModern, isLegacy }).</p>
<p>Call <code>useFetch</code> like foo({ query: { page } }).</p>
<p>Escaped ({ a, b }) and {# heading} stay text.</p>
```

## Markdown

```md
The function will receive an object (\{ isDev, isServer, isClient, isModern, isLegacy }).

Call `useFetch` like foo(\{ query: \{ page } }).

Escaped (\{ a, b }) and \{# heading} stay text.
```
