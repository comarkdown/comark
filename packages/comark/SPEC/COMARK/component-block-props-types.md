## Input

```md
::component
---
title: Hello World
count: 42
enabled: true
hidden: false
tags:
  - markdown
  - docs
config:
  theme: dark
  debug: false
---
Component content
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "component",
      {
        "title": "Hello World",
        "count": "42",
        ":enabled": "true",
        "hidden": "false",
        "tags": [
          "markdown",
          "docs"
        ],
        "config": {
          "theme": "dark",
          "debug": false
        }
      },
      "Component content"
    ]
  ]
}
```

## HTML

```html
<component title="Hello World" count="42" enabled hidden="false" tags="[\"markdown\",\"docs\"]" config="{\"theme\":\"dark\",\"debug\":false}">
  Component content
</component>
```

## Markdown

```md
::component
```yaml [props]
title: Hello World
count: '42'
enabled: true
hidden: false
tags:
  - markdown
  - docs
config:
  theme: dark
  debug: false
```
Component content
::
```
