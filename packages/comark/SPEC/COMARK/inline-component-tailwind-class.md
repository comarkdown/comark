## Input

```md
Hello :badge{.bg-[#fff].text-[12px]} world
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
      "Hello ",
      [
        "badge",
        {
          "class": "bg-[#fff] text-[12px]"
        }
      ],
      " world"
    ]
  ]
}
```

## HTML

```html
<p>
  Hello <badge class="bg-[#fff] text-[12px]"></badge> world
</p>
```

## Markdown

```md
Hello :badge{.bg-[#fff].text-[12px]} world
```
