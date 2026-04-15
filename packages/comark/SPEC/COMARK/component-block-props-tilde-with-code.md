## Input

```md
::code-preview
~~~yaml [props]
title: Quick Start
description: A code preview
lang: typescript
source: "```ts\nconst x = 1\n```"
~~~
Preview content here
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "code-preview",
      {
        "title": "Quick Start",
        "description": "A code preview",
        "lang": "typescript",
        "source": "```ts\nconst x = 1\n```"
      },
      "Preview content here"
    ]
  ]
}
```

## HTML

```html
<code-preview title="Quick Start" description="A code preview" lang="typescript" source="```ts
const x = 1
```">
  Preview content here
</code-preview>
```

## Markdown

```md
::code-preview
~~~yaml [props]
title: Quick Start
description: A code preview
lang: typescript
source: |-
  ```ts
  const x = 1
  ```
~~~
Preview content here
::
```
