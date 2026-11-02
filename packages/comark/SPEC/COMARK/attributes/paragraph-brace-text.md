## Input

```md
The function will receive an object ({ isDev, isServer, isClient, isModern, isLegacy }).

The function will receive an object ({ isDev isServer isClient isModern isLegacy }).

Call `useFetch` like foo({ query: { page } }).

Escaped \({ a, b }) and {\# heading} stay text.

See [a {b,](/x) and **bold**{.red} }

Pass {a, `}` {b}} along.
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
      "The function will receive an object ({ isDev isServer isClient isModern isLegacy })."
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
    ],
    [
      "p",
      {},
      "See ",
      [
        "a",
        {
          "href": "/x"
        },
        "a {b,"
      ],
      " and ",
      [
        "strong",
        {
          "class": "red"
        },
        "bold"
      ],
      " }"
    ],
    [
      "p",
      {},
      "Pass {a, ",
      [
        "code",
        {},
        "}"
      ],
      " {b}} along."
    ]
  ]
}
```

## HTML

```html
<p>The function will receive an object ({ isDev, isServer, isClient, isModern, isLegacy }).</p>
<p>The function will receive an object ({ isDev isServer isClient isModern isLegacy }).</p>
<p>Call <code>useFetch</code> like foo({ query: { page } }).</p>
<p>Escaped ({ a, b }) and {# heading} stay text.</p>
<p>See <a href="/x">a {b,</a> and <strong class="red">bold</strong> }</p>
<p>Pass {a, <code>}</code> {b}} along.</p>
```

## Markdown

```md
The function will receive an object (\{ isDev, isServer, isClient, isModern, isLegacy }).

The function will receive an object (\{ isDev isServer isClient isModern isLegacy }).

Call `useFetch` like foo(\{ query: \{ page } }).

Escaped (\{ a, b }) and \{# heading} stay text.

See [a \{b,](/x) and **bold**{.red} }

Pass \{a, `}` \{b}} along.
```
