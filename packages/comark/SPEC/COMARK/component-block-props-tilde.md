## Input

```md
::component
~~~yaml [props]
title: Hello
color: primary
size: lg
variant: soft
~~~
Content
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
        "title": "Hello",
        "color": "primary",
        "size": "lg",
        "variant": "soft"
      },
      "Content"
    ]
  ]
}
```

## HTML

```html
<component title="Hello" color="primary" size="lg" variant="soft">
  Content
</component>
```

## Markdown

```md
::component
```yaml [props]
title: Hello
color: primary
size: lg
variant: soft
```
Content
::
```
