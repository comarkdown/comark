## Input

```md
::card{.bg-[#111].text-[1.25rem]}
Hello
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "card",
      {
        "class": "bg-[#111] text-[1.25rem]"
      },
      "Hello"
    ]
  ]
}
```

## HTML

```html
<card class="bg-[#111] text-[1.25rem]">
  Hello
</card>
```

## Markdown

```md
::card{.bg-[#111].text-[1.25rem]}
Hello
::
```
