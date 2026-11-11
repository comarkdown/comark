# Complex Document

This is a paragraph with an ![inline image](https://safe.com/1.png) that should be fine.

> ## Quoted Section
> 
> Here's a blockquote with an image: ![quoted](javascript:alert('XSS'))
> 
> > Nested quote with ![nested image](javascript:alert('XSS'))

- List item with ![image1](https://safe.com/2.png)
  - Nested with ![image2](javascript:alert('XSS'))
    - Deep nesting ![image3](javascript:alert('XSS'))

```
![This is in a code block](javascript:alert('XSS'))
```

| Header 1 | Header 2 |
|----------|----------|
| ![cell1](javascript:alert('XSS')) | Regular text |
| Text | ![cell2](javascript:alert('XSS')) |

<details>
<summary>![summary image](javascript:alert('XSS'))</summary>
![details image](javascript:alert('XSS'))
</details>

---

[ref1]: javascript:alert('XSS')
[ref2]: https://safe.com/image.png

Using references: ![image][ref1] and ![image][ref2]