# Advanced Markdown Features Exploits

## Test 1: Task Lists
- [ ] Normal task
- [x] Completed task [link](javascript:alert(1))
- [X] [Malicious task](javascript:alert(1))

## Test 2: Strikethrough with Links
~~Normal strikethrough~~ ~~[malicious](javascript:alert(1))~~

## Test 3: Footnotes (if supported)
Here's a reference[^1] to a footnote.

[^1]: This is a footnote with [malicious link](javascript:alert(1))

## Test 4: Definition Lists
Term 1
: Definition with [malicious link](javascript:alert(1))

Term 2
: Multiple definitions
: [Another malicious](javascript:alert(2))

## Test 5: Abbreviations
*[HTML]: HyperText Markup Language with [link](javascript:alert(1))

## Test 6: Keyboard Keys
Press <kbd>Ctrl</kbd>+<kbd>[link](javascript:alert(1))</kbd>

## Test 7: Highlighted Text
==Highlighted text== with ==highlighted [link](javascript:alert(1))==

## Test 8: Subscript and Superscript
H~2~O with H~[link](javascript:alert(1))~O
E=mc^2^ with E=mc^[link](javascript:alert(1))^

## Test 9: Math Expressions (if supported)
$$\sum_{i=1}^{n} [link](javascript:alert(1))$$

## Test 10: Complex Table with Links
| Header 1 | Header 2 |
|----------|----------|
| Cell [link](javascript:alert(1)) | Normal |
| [Malicious](javascript:alert(2)) | Cell |

## Test 11: Table with HTML
| HTML | Markdown |
|------|----------|
| <a href="javascript:alert(1)">HTML link</a> | [MD link](javascript:alert(2)) |

## Test 12: Nested Blockquotes with Links
> Level 1 quote
> > Level 2 quote with [link](javascript:alert(1))
> > > Level 3 with [malicious](javascript:alert(2))

## Test 13: Code Block with Language and Link
```javascript
function malicious() {
  // [fake link](javascript:alert(1))
}
```

## Test 14: Complex List Nesting
1. First item
   - Nested bullet [link](javascript:alert(1))
   - Another nested
     1. Deep nested [malicious](javascript:alert(2))
        - Even deeper [link](javascript:alert(3))

## Test 15: Mixed Content Block
> This is a quote with **bold [link](javascript:alert(1))** and
> 
> ```javascript
> // code with [fake link](javascript:alert(2))
> ```
> 
> - And a list item [malicious](javascript:alert(3))