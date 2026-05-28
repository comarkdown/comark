## Input

```md
::pre{.border-2 .border-primary}
```ts
const variable = "value"
```
::
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
        "language": "ts",
        "class": "border-2 border-primary"
      },
      [
        "code",
        {
          "class": "language-ts"
        },
        "const variable = \"value\""
      ]
    ]
  ]
}
```

## HTML

```html
<pre language="ts" class="border-2 border-primary"><code class="language-ts">const variable = "value"</code></pre>
```

## Markdown

```md
::pre{.border-2.border-primary}
```ts
const variable = "value"
```
::
```
