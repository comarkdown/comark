## Input

```md
::pre{attr="value"}
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
        "attr": "value"
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
<pre language="ts" attr="value"><code class="language-ts">const variable = "value"</code></pre>
```

## Markdown

```md
::pre{attr="value"}
```ts
const variable = "value"
```
::
```
