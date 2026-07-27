## Input

```md
[Document](#)

[[1] Document](#)

[[link-name] more](https://example.com)
```

## AST

```json

{
   "frontmatter":{
      
   },
   "meta":{
      
   },
   "nodes":[
      [
         "p",
         {
            
         },
         [
            "a",
            {
               "href":"#"
            },
            "Document"
         ]
      ],
      [
         "p",
         {
            
         },
         [
            "a",
            {
               "href":"#"
            },
            "[1] Document"
         ]
      ],
      [
         "p",
         {
            
         },
         [
            "a",
            {
               "href":"https://example.com"
            },
            "[link-name] more"
         ]
      ]
   ]
}
```

## HTML

```html
<p><a href="#">Document</a></p>
<p><a href="#">[1] Document</a></p>
<p><a href="https://example.com">[link-name] more</a></p>
```

## Markdown

```md
[Document](#)

[\[1\] Document](#)

[\[link-name\] more](https://example.com)
```
