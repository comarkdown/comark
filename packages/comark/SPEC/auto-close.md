---
# Behavioral SPEC for autoCloseMarkdown (not a parse fixture).
# Exercised by test/auto-close-spec.test.ts — skip the Input/AST/HTML runner.
# Behavioral SPEC for remend (streaming auto-close).
# Source: comark SPEC/auto-close.md + cases extracted from packages/remend/__tests__.
# Exercised by __tests__/auto-close-spec.test.ts and scripts/compare-auto-close.mjs
skip: true
---

# Auto Close Markdown Spec
# Auto Close Markdown Spec (remend)

Self-healing markdown for streaming. Completes incomplete syntax so partial AI output still renders cleanly.

options:
- incompleteLinkPlaceholder: a placeholder for incomplete links (default: `comark:incomplete-link`)
- incompleteImagePlaceholder: a placeholder for incomplete images (default: `comark:incomplete-image`)
- math: auto-close inline `$…$` and block `$$…$$` (default: `false`)
- dropTrailingOpeners: drop a trailing opener after whitespace at EOF (`hello *` → `hello`) so half-typed markers do not flash (default: `false`; enabled when parsing with `streaming: true`)
options (remend):
- incompleteLinkPlaceholder: `comark:incomplete-link`
- incompleteImagePlaceholder: `comark:incomplete-image`
- katex / inlineKatex: auto-close `$$…$$` / `$…$` (inlineKatex defaults off)
- linkMode: `protocol` | `text-only`
- per-case overrides may appear as `+ expected  (katex: true, linkMode: 'text-only')`

comark-only (not implemented by remend):
- dropTrailingOpeners: drop a trailing opener after whitespace at EOF (`hello *` → `hello`)


---
```

<!-- +21 from remend/__tests__ -->



```diff
- **bold1** and **bold2**
+ **bold1** and **bold2**
```

```diff
- Here is some **bold tex
+ Here is some **bold tex**
```

```diff
- **xxx*
+ **xxx**
```

```diff
- Text with **bold*
+ Text with **bold**
```

```diff
- This is **bold text*
+ This is **bold text**
```

```diff
- *italic **bold
+ *italic **bold***
```

```diff
- **bold*
+ **bold**
```

```diff [valid]
- | **bold** | next |
+ | **bold** | next |\n| --- | --- |
```

```diff
- | **bold** | next |
+ | **bold** | next |\n| --- | --- |
```

```diff
- **bold** then **more
+ **bold** then **more**
```

```diff
- paragraph1\n\n**bold
+ paragraph1\n\n**bold**
```

```diff
- text\n\n\n**bold
+ text\n\n\n**bold**
```

```diff
- **中文粗体
+ **中文粗体**
```

```diff
- **Hello 世界
+ **Hello 世界**
```

```diff
- ---\n**bold after rule
+ ---\n**bold after rule**
```

```diff
- # Heading\n**bold
+ # Heading\n**bold**
```

```diff
- > quote\n**bold
+ > quote\n**bold**
```

```diff
- *a**b
+ *a**b***
```

```diff
- **bold text
+ **bold text  (bold: false)
```

```diff
- **bold *italic
+ **bold *italic*  (bold: false)
```

```diff [valid]
- **bold *italic
+ **bold *italic  (italic: false)
```


---

## Italic (asterisk)
```

<!-- +12 from remend/__tests__ -->



```diff
- text*
+ text*
```

```diff
- *first* and *second
+ *first* and *second*
```

```diff
- line1\n\n*italic text
+ line1\n\n*italic text*
```

```diff
- *日本語
+ *日本語*
```

```diff
- Text with *italic text*
+ Text with *italic text*
```

```diff [valid]
- *italic with some*var*name inside
+ *italic with some*var*name inside*
```

```diff
- test*var and *incomplete italic
+ test*var and *incomplete italic*
```

```diff
- *start \* middle \* end
+ *start \* middle \* end*
```

```diff
- abc*123
+ abc*123
```

```diff
- 123*abc
+ 123*abc
```

```diff
- This is *italic
+ This is *italic*
```

```diff
- *word* and more text
+ *word* and more text
```


---

## Italic (underscore)
```

<!-- +49 from remend/__tests__ -->



```diff
- __content_
+ __content__
```

```diff
- _text**
+ _text**_
```

```diff
- __a__ __b__content_
+ __a__ __b__content__
```

```diff
- __incomplete
+ __incomplete__
```

```diff
- Text with __italic text__
+ Text with __italic text__
```

```diff
- __xxx_
+ __xxx__
```

```diff
- Text with __bold_
+ Text with __bold__
```

```diff
- This is __bold text_
+ This is __bold text__
```

```diff
- Text with _italic text_
+ Text with _italic text_
```

```diff
- __bold__ and _italic
+ __bold__ and _italic_
```

```diff
- Text with \_escaped underscore
+ Text with \_escaped underscore
```

```diff
- some\_text_with_underscores
+ some\_text_with_underscores
```

```diff
- Start \_escaped\_ middle _incomplete
+ Start \_escaped\_ middle _incomplete_
```

```diff
- \_fully\_escaped\_
+ \_fully\_escaped\_
```

```diff
- \_escaped\_ _complete_ pair
+ \_escaped\_ _complete_ pair
```

```diff [valid]
- café_price
+ café_price
```

```diff
- naïve_approach
+ naïve_approach
```

```diff
- some_variable_name
+ some_variable_name
```

```diff
- test_123_value
+ test_123_value
```

```diff
- _start with underscore
+ _start with underscore_
```

```diff
- _italic with some_var_name inside
+ _italic with some_var_name inside_
```

```diff
- test_var and _incomplete italic
+ test_var and _incomplete italic_
```

```diff
- _incomplete\n\n
+ _incomplete_\n\n
```

```diff
- Start _text\n
+ Start _text_\n
```

```diff
- hello_world_test
+ hello_world_test
```

```diff
- The user_name and user_email are required
+ The user_name and user_email are required
```

```diff
- Visit https://example.com/path_with_underscore
+ Visit https://example.com/path_with_underscore
```

```diff
- The value is 1_000_000
+ The value is 1_000_000
```

```diff
- _italic text
+ _italic text_
```

```diff
- This is _italic
+ This is _italic_
```

```diff
- _italic\n
+ _italic_\n
```

```diff
- word_
+ word_
```

```diff
- _privateVariable
+ _privateVariable_
```

```diff
- Use `variable_name` in your code
+ Use `variable_name` in your code
```

```diff
- _complete italic_ and some_other_text
+ _complete italic_ and some_other_text
```

```diff
- ```\nfunction_name()\n```
+ ```\nfunction_name()\n```
```

```diff
- <div data_attribute="value">
+ <div data_attribute="value">
```

```diff
- __init__ and __main__ are special
+ __init__ and __main__ are special
```

```diff
- The user_id field stores the _unique identifier
+ The user_id field stores the _unique identifier_
```

```diff
- hello_world\n\n<a href="example_link"/>
+ hello_world\n\n<a href="example_link"/>
```

```diff
- fields user__id and org__id are join keys
+ fields user__id and org__id are join keys
```

```diff
- Use snake__case and __bold
+ Use snake__case and __bold__
```

```diff
- the value of some__field is set
+ the value of some__field is set
```

```diff
- `obj__attr` and __bold
+ `obj__attr` and __bold__
```

```diff
- **bold snake__case text** and more
+ **bold snake__case text** and more
```

```diff
- a ____ b
+ a ____ b
```

```diff
- text\n\n___\n
+ text\n\n___\n
```

```diff [valid]
- ___both___ done
+ ___both___ done
```

```diff [valid]
- \___bold
+ \___bold__
```


---

## Bold + italic
```

<!-- +23 from remend/__tests__ -->



```diff
- Text with ***bold and italic text***
+ Text with ***bold and italic text***
```

```diff
- ***first*** and ***second***
+ ***first*** and ***second***
```

```diff
- ***Starting bold-italic
+ ***Starting bold-italic***
```

```diff
- ***bold-italic with `code
+ ***bold-italic with `code***`
```

```diff
- This is
+ This is
```

```diff
- This is ***very important***
+ This is ***very important***
```

```diff
- This is ***very important*** to know
+ This is ***very important*** to know
```

```diff
- text ***
+ text ***
```

```diff
- text ****
+ text ****
```

```diff
- text *****
+ text *****
```

```diff
- text ******
+ text ******
```

```diff
- text***
+ text***
```

```diff
- word****
+ word****
```

```diff
- end******
+ end******
```

```diff
- ***start***end***
+ ***start***end***
```

```diff
- ***text***
+ ***text***
```

```diff
- ***word text***
+ ***word text***
```

```diff
- **bold and *italic*** more text
+ **bold and *italic*** more text
```

```diff
- test **bold and *italic*** end
+ test **bold and *italic*** end
```

```diff
- - Combined **bold and *italic*** text
+ - Combined **bold and *italic*** text
```

```diff [valid]
- ****text
+ ****text****
```

```diff [valid]
- *****text
+ *****text*****
```

```diff
- **bold and *bold-italic***
+ **bold and *bold-italic***
```


---

## Inline code
```

<!-- +16 from remend/__tests__ -->



```diff [valid]
- | `code` | next |
+ | `code` | next |\n| --- | --- |
```

```diff
- `code` then `more
+ `code` then `more`
```

```diff
- text\n\n`code
+ text\n\n`code`
```

```diff
- `한국어 코드
+ `한국어 코드`
```

```diff
- `code1` and `code2`
+ `code1` and `code2`
```

```diff
- ```javascript\nconst x = `template
+ ```javascript\nconst x = `template
```

```diff
- ```python print("Hello, Sunnyvale!")```
+ ```python print("Hello, Sunnyvale!")```
```

```diff
- ```python print("Hello, Sunnyvale!")``
+ ```python print("Hello, Sunnyvale!")```
```

```diff
- ```code```
+ ```code```
```

```diff
- ```code```\n
+ ```code```\n
```

```diff
- ```\ncode\n```
+ ```\ncode\n```
```

```diff
- ``````
+ ``````
```

```diff
- text``````
+ text``````
```

```diff
- \` *italic
+ \` *italic*
```

```diff
- **bold
+ **bold**
```

```diff
- *italic
+ *italic*
```


---

## Strikethrough
```

<!-- +29 from remend/__tests__ -->



```diff [valid]
- **bold then *italic then ~~strike
+ **bold then *italic then ~~strike~~***
```

```diff
- ~~strike **bold *italic
+ ~~strike **bold *italic*~~
```

```diff [valid]
- *italic **bold ~~strike `code
+ *italic **bold ~~strike `code`~~***
```

```diff [valid]
- **bold ~~strike
+ **bold ~~strike~~**
```

```diff
- ~~strike~
+ ~~strike~~
```

```diff
- > ~~struck text
+ > ~~struck text~~
```

```diff
- - [x] completed ~~struck~~
+ - [x] completed ~~struck~~
```

```diff
- ~~done~~ and ~~undone
+ ~~done~~ and ~~undone~~
```

```diff [valid]
- **bold *italic ~~strike `code
+ **bold *italic ~~strike `code`~~***
```

```diff
- ***bold-italic ~~strike `code
+ ***bold-italic ~~strike `code`~~***
```

```diff
- ~~🎉 celebration
+ ~~🎉 celebration~~
```

```diff
- **bold *italic `code ~~strike
+ **bold *italic `code ~~strike  (bold: false, italic: false, inlineCode: false, strikethrough: false, boldItalic: false)
```

```diff
- **bold ~~strike
+ **bold ~~strike~~  (bold: false)
```

```diff
- a~~b~~text
+ a~~b~~text
```

```diff
- a~~b~~c~
+ a~~b~~c~
```

```diff
- * _ ~~ `
+ * _ ~~ `
```

```diff
- ~~text
+ ~~text~~
```

```diff
- text~~
+ text~~
```

```diff
- `~~strikethrough`
+ `~~strikethrough`
```

```diff
- ~~strike
+ ~~strike~~
```

```diff
- - ~~
+ - ~~
```

```diff
- **bold** and *italic* and `code` and ~~strike~~
+ **bold** and *italic* and `code` and ~~strike~~
```

```diff
- # Heading\n\n**Bold text** with *italic* and `code`.\n\n- List item\n- Another item with ~~strike~~
+ # Heading\n\n**Bold text** with *italic* and `code`.\n\n- List item\n- Another item with ~~strike~~
```

```diff [valid]
- **bold *italic `code ~~strike
+ **bold *italic `code ~~strike`***
```

```diff
- Text with ~~strikethrough text~~
+ Text with ~~strikethrough text~~
```

```diff
- ~~strike1~~ and ~~strike2~~
+ ~~strike1~~ and ~~strike2~~
```

```diff
- ~~xxx~
+ ~~xxx~~
```

```diff
- Text with ~~strike~
+ Text with ~~strike~~
```

```diff
- This is ~~strikethrough~
+ This is ~~strikethrough~~
```


---

## Single tilde escape
```

<!-- +9 from remend/__tests__ -->



```diff
- 20~25°C。20~25°C
+ 20\~25°C。20\~25°C
```

```diff
- ```\n20~25\n```
+ ```\n20~25\n```
```

```diff
- `20~25`
+ `20~25`
```

```diff
- 20~25°C
+ 20~25°C  (singleTilde: false)
```

```diff
- 日本~語
+ 日本\~語
```

```diff
- α~β
+ α\~β
```

```diff
- é~x
+ é\~x
```

```diff
- 𐐀~a
+ 𐐀\~a
```

```diff
- foo~bar~baz
+ foo\~bar\~baz
```


---

## Links (default protocol mode)
```diff
- Text with [incomplete link
+ Text with [incomplete link](comark:incomplete-link)
+ Text with [incomplete link](comark:incomplete-link)
```

```diff
- Visit [our site](https://exa
+ Visit [our site](comark:incomplete-link)
+ Visit [our site](comark:incomplete-link)
```

```diff
- [outer [nested] text](incomplete
+ [outer [nested] text](comark:incomplete-link)
+ [outer [nested] text](comark:incomplete-link)
```

```diff
- Text [outer [inner
+ Text [outer [inner](comark:incomplete-link)
+ Text [outer [inner](comark:incomplete-link)
```

Leaves finished links alone:
```

<!-- +23 from remend/__tests__ -->



```diff
- [link1 and [link2
+ [link1 and [link2](comark:incomplete-link)
```

```diff
- [first](url1) and [second
+ [first](url1) and [second](comark:incomplete-link)
```

```diff
- [outer [inner]
+ [outer [inner]](comark:incomplete-link)
```

```diff
- [**bold link**](incomplete-url
+ [**bold link**](comark:incomplete-link)
```

```diff
- [*italic link*](incomplete
+ [*italic link*](comark:incomplete-link)
```

```diff
- [`code link`](incomplete
+ [`code link`](comark:incomplete-link)
```

```diff
- [**bold link
+ [**bold link](comark:incomplete-link)
```

```diff
- [text][ref]
+ [text][ref]
```

```diff
- [^1]
+ [^1]
```

```diff
- [text][
+ [text][](comark:incomplete-link)
```

```diff
- [^1]: footnote text
+ [^1]: footnote text
```

```diff
- [link text
+ [link text](comark:incomplete-link)
```

```diff
- Check the [documentation
+ Check the [documentation](comark:incomplete-link)
```

```diff
- Here's a code block:\n```bash\necho "test"\n```\nAnd here's an [incomplete link
+ Here's a code block:\n```bash\necho "test"\n```\nAnd here's an [incomplete link](comark:incomplete-link)
```

```diff
- [link](a_b) _word
+ [link](a_b) _word_
```

```diff
- Text [partial
+ Text [partial](comark:incomplete-link)
```

```diff
- [link1](url1) and [link2](url2)
+ [link1](url1) and [link2](url2)
```

```diff
- [link with [inner] content](http://incomplete
+ [link with [inner] content](comark:incomplete-link)
```

```diff
- Text [foo [bar] baz](
+ Text [foo [bar] baz](comark:incomplete-link)
```

```diff
- [link with [brackets] inside](https://example.com)
+ [link with [brackets] inside](https://example.com)
```

```diff
- [foo [bar [baz
+ [foo [bar [baz](comark:incomplete-link)
```

```diff
- Text [outer [inner]
+ Text [outer [inner]](comark:incomplete-link)
```

```diff
- [link [nested] text
+ [link [nested] text](comark:incomplete-link)
```


---

## Links (text-only mode)
```

<!-- +14 from remend/__tests__ -->



```diff
- [incomplete link
+ incomplete link  (linkMode: 'text-only')
```

```diff
- [link1 and [link2
+ link1 and link2  (linkMode: 'text-only')
```

```diff [valid]
- ![img [text
+ ![img text](comark:incomplete-image)  (linkMode: 'text-only')
```

```diff
- [link](url) [incomplete
+ [link](url) incomplete  (linkMode: 'text-only')
```

```diff
- [text] [incomplete
+ [text] incomplete  (linkMode: 'text-only')
```

```diff
- [a]( b](c [incomplete
+ [a]( b](c incomplete  (linkMode: 'text-only')
```

```diff
- Text [partial
+ Text partial  (linkMode: 'text-only')
```

```diff
- [link with [inner] content](http://incomplete
+ link with [inner] content  (linkMode: 'text-only')
```

```diff
- Text [foo [bar] baz](
+ Text foo [bar] baz  (linkMode: 'text-only')
```

```diff
- Text [outer [inner
+ Text outer inner  (linkMode: 'text-only')
```

```diff
- [foo [bar [baz
+ foo bar baz  (linkMode: 'text-only')
```

```diff
- Text [outer [inner]
+ Text outer [inner]  (linkMode: 'text-only')
```

```diff
- [link [nested] text
+ link [nested] text  (linkMode: 'text-only')
```

```diff
- Text ![incomplete image
+ Text ![incomplete image](comark:incomplete-image)  (linkMode: 'text-only')
```


---

## Images
```diff
- Text with ![incomplete image
+ Text with ![incomplete image](comark:incomplete-image)
+ Text with ![incomplete image](comark:incomplete-image)
```

```diff
- Text with ![incomplete image]
+ Text with ![incomplete image](comark:incomplete-image)
+ Text with ![incomplete image](comark:incomplete-image)
```

```diff
- ![partial
+ ![partial](comark:incomplete-image)
+ ![partial](comark:incomplete-image)
```

```diff
- ![logo](./assets/log
+ ![logo](comark:incomplete-image)
+ ![logo](comark:incomplete-image)
```

```diff [valid]
- Text ![outer [inner]
+ Text ![outer [inner]](comark:incomplete-image)
+ Text ![outer [inner]](comark:incomplete-image)
```

Still uses image placeholder even in link text-only mode:
```diff
- Text ![alt](http://partial
+ Text ![alt](comark:incomplete-image)
+ Text ![alt](comark:incomplete-image)
```

Leaves finished images alone:
```

<!-- +10 from remend/__tests__ -->



```diff
- Here's the diagram:\n\n![architecture
+ Here's the diagram:\n\n![architecture](comark:incomplete-image)
```

```diff
- See ![diagram](http://example.com/img
+ See ![diagram](comark:incomplete-image)
```

```diff
- [link](url) _word
+ [link](url) _word_
```

```diff
- func(_arg
+ func(_arg_
```

```diff
- See ![the diag
+ See ![the diag](comark:incomplete-image)
```

```diff [valid]
- ![nested [brackets] text
+ ![nested [brackets] text](comark:incomplete-image)
```

```diff [valid]
- Start ![foo [bar] baz
+ Start ![foo [bar] baz](comark:incomplete-image)
```

```diff
- textContent ![image](https://img.alicdn.com/imgextra/i4/6000000003603/O1CN01ApW8bQ1cUE8LduPra_!!6000000003603-2-skyky.png)
+ textContent ![image](https://img.alicdn.com/imgextra/i4/6000000003603/O1CN01ApW8bQ1cUE8LduPra_!!6000000003603-2-skyky.png)
```

```diff
- textContent [link](https://example.com/path_name!!test)
+ textContent [link](https://example.com/path_name!!test)
```

```diff
- textContent ![image1](https://example.com/path_1!!test.png) ![image2](https://example.com/path_2!!test.png)
+ textContent ![image1](https://example.com/path_1!!test.png) ![image2](https://example.com/path_2!!test.png)
```


---

## Block math (KaTeX)
```

<!-- +27 from remend/__tests__ -->



```diff
- $$\frac{x}{y
+ $$\frac{x}{y$$
```

```diff
- $$\begin{matrix} a
+ $$\begin{matrix} a$$
```

```diff
- $$\n\sum_{i=0}^{n} x_i
+ $$\n\sum_{i=0}^{n} x_i\n$$
```

```diff
- $$formula
+ $$formula  (katex: false, math: false)
```

```diff
- Text with $$E = mc^2$$
+ Text with $$E = mc^2$$
```

```diff
- $$formula1$$ and $$formula2$$
+ $$formula1$$ and $$formula2$$
```

```diff
- $$x + y = z
+ $$x + y = z$$
```

```diff
- $$x = y$
+ $$x = y$$
```

```diff
- The variable $x_1$ represents the first element
+ The variable $x_1$ represents the first element
```

```diff
- Formula: $a_b + c_d = e_f$
+ Formula: $a_b + c_d = e_f$
```

```diff
- $$\na_1 + b_2\nc_3 + d_4\n$$
+ $$\na_1 + b_2\nc_3 + d_4\n$$
```

```diff
- Math expression $x_
+ Math expression $x_$
```

```diff
- Text with _italic_ and math $x_1$
+ Text with _italic_ and math $x_1$
```

```diff
- _italic text_ followed by $a_b$
+ _italic text_ followed by $a_b$
```

```diff
- Start _italic with $x_1$
+ Start _italic with $x_1$_
```

```diff
- $x_1 + x_2 + x_3 = y_1$
+ $x_1 + x_2 + x_3 = y_1$
```

```diff
- $$\sum_{i=1}^{n} x_i = \prod_{j=1}^{m} y_j$$
+ $$\sum_{i=1}^{n} x_i = \prod_{j=1}^{m} y_j$$
```

```diff
- Price is \$50 and _this is italic_
+ Price is \$50 and _this is italic_
```

```diff
- Cost \$100 with _incomplete
+ Cost \$100 with _incomplete_
```

```diff
- Inline $x_1$ and block $$y_2$$ math
+ Inline $x_1$ and block $$y_2$$ math
```

```diff
- _italic start $x_1$ italic end_
+ _italic start $x_1$ italic end_
```

```diff
- Streamdown uses double dollar signs (`$$`) to delimit mathematical expressions.
+ Streamdown uses double dollar signs (`$$`) to delimit mathematical expressions.
```

```diff
- Use `$$` for math blocks and `$$formula$$` for inline.
+ Use `$$` for math blocks and `$$formula$$` for inline.
```

```diff [valid]
- Math: $$x+y and code: `$$`
+ Math: $$x+y and code: `$$`$$
```

```diff
- $$formula$$ and code `$$` and $$incomplete
+ $$formula$$ and code `$$` and $$incomplete$$
```

```diff
- $$\n\mathbf{w}^{*} = \underset{\|\mathbf{w}\|=1}{\arg\max} \;\; \mathbf{w}^T S \mathbf{w}\n$$
+ $$\n\mathbf{w}^{*} = \underset{\|\mathbf{w}\|=1}{\arg\max} \;\; \mathbf{w}^T S \mathbf{w}\n$$
```

```diff
- Text with *italic* and math $$x^{*}$$
+ Text with *italic* and math $$x^{*}$$
```


---

## Inline math

Closes unclosed `$…$` when `math: true` (default off for bare `autoCloseMarkdown`; on via `parseMarkdown`).
Closes unclosed `$…$` when `math: true` (default off for bare `remend`; on via `parseMarkdown`).

```diff
- Text with $formula
```

<!-- +25 from remend/__tests__ -->



```diff
- text234$
+ text234$
```

```diff [valid]
- text123$
+ text123  (math: true, dropTrailingOpeners: true)
```

```diff
- text$d
+ text$d$  (math: true)
```

```diff
- $x^2 + y^2
+ $x^2 + y^2$  (math: true)
```

```diff
- The price is $50 and $100
+ The price is $50 and $100
```

```diff
- $incomplete
+ $incomplete
```

```diff
- Text with $x^2 + y^2 = z^2$
+ Text with $x^2 + y^2 = z^2$
```

```diff
- $a = 1$ and $b = 2$
+ $a = 1$ and $b = 2$
```

```diff
- $first$ and $second
+ $first$ and $second
```

```diff
- $$block$$ and $inline
+ $$block$$ and $inline
```

```diff
- $x + y = z
+ $x + y = z
```

```diff
- Price is \$100
+ Price is \$100
```

```diff
- $$$
+ $$$$$
```

```diff
- $$$$
+ $$$$
```

```diff
- The formula
+ The formula
```

```diff
- The formula $E
+ The formula $E
```

```diff
- The formula $E = mc
+ The formula $E = mc
```

```diff
- The formula $E = mc^2
+ The formula $E = mc^2
```

```diff
- The formula $E = mc^2$ shows
+ The formula $E = mc^2$ shows
```

```diff
- $incomplete
+ $incomplete$  (inlineKatex: true)
```

```diff
- The formula $E
+ The formula $E$  (inlineKatex: true)
```

```diff
- The formula $E = mc
+ The formula $E = mc$  (inlineKatex: true)
```

```diff
- The formula $E = mc^2
+ The formula $E = mc^2$  (inlineKatex: true)
```

```diff
- Use `$var` for variables and $formula
+ Use `$var` for variables and $formula$  (inlineKatex: true)
```

```diff
- Inline $x$ and block $$y$$
+ Inline $x$ and block $$y$$  (inlineKatex: true)
```

```diff
- $$block$$ then $x + y
+ $$block$$ then $x + y$  (inlineKatex: true)
```


---

## Incomplete HTML tags
```

<!-- +32 from remend/__tests__ -->



```diff
- text <!-- incomplete comment
+ text <!-- incomplete comment
```

```diff
- text <script>alert('
+ text <script>alert('
```

```diff
- text <div class="test
+ text
```

```diff
- text <br>
+ text <br>
```

```diff
- text <!-- comment -->
+ text <!-- comment -->
```

```diff
- div> _text
+ div> _text_
```

```diff
- 3<5 _text
+ 3<5 _text_
```

```diff
- <div>\n_text
+ <div>\n_text_
```

```diff
- Hello <custom
+ Hello
```

```diff
- Hello <casecard
+ Hello
```

```diff
- Text <MyComponent
+ Text
```

```diff
- Hello </custom
+ Hello
```

```diff
- Hello <div class=
+ Hello
```

```diff
- Hello <a href="https://example.com
+ Hello
```

```diff
- <custom data-id
+ 
```

```diff
- <br/>
+ <br/>
```

```diff
- <img src='test'>
+ <img src='test'>
```

```diff
- x < y
+ x < y
```

```diff
- if a <
+ if a <
```

```diff
- value <1
+ value <1
```

```diff
- ```\n<div\n```
+ ```\n<div\n```
```

```diff
- ```html\n<custom
+ ```html\n<custom
```

```diff [valid]
- `<div`
+ `<div`
```

```diff
- <div
+ 
```

```diff
- <custom
+ 
```

```diff
- </div
+ 
```

```diff
- Some text here\n\n<casecard
+ Some text here\n\n
```

```diff
- # Heading\n\nParagraph <custom
+ # Heading\n\nParagraph
```

```diff [valid]
- <a target="_blank" href="https://link.com">word</a>
+ <a target="_blank" href="https://link.com">word</a>
```

```diff [valid]
- <a target="_blank">link</a>
+ <a target="_blank">link</a>
```

```diff
- <iframe src="x" sandbox="allow_scripts">
+ <iframe src="x" sandbox="allow_scripts">
```

```diff
- Hello <div
+ Hello <div  (htmlTags: false)
```


---

## Comparison operators in lists
```

<!-- +11 from remend/__tests__ -->



```diff
- + > 25: rich
+ + \> 25: rich
```

```diff
- 2) > 10: high
+ 2) \> 10: high
```

```diff
-   - > 25: rich
+   - \> 25: rich
```

```diff
-     - > 5: expensive
+     - \> 5: expensive
```

```diff
- > 25 is a number
+ > 25 is a number
```

```diff
- - > Read more about this
+ - > Read more about this
```

```diff
- >25
+ >25
```

```diff
- ```\n- > 25: in code\n```
+ ```\n- > 25: in code\n```
```

```diff
- - >25: rich
+ - \>25: rich
```

```diff
- - > 25: rich
+ - > 25: rich  (comparisonOperators: false)
```

```diff
- - > 25: **bold
+ - \> 25: **bold**
```


---

## Setext heading guard
```

<!-- +19 from remend/__tests__ -->



```diff
- \n=
+ \n=
```

```diff
- \n==
+ \n==
```

```diff
- -
+ -
```

```diff
- \n-
+ \n-
```

```diff
- Line 1\nLine 2\nLine 3\n-
+ Line 1\nLine 2\nLine 3\n-​
```

```diff
- Some text\n  -
+ Some text\n  -​
```

```diff
- Some text\n- Item 1\n- Item 2
+ Some text\n- Item 1\n- Item 2
```

```diff
- Some text\n-x
+ Some text\n-x
```

```diff
- Some text\n----
+ Some text\n----
```

```diff
- Some text\n- 
+ Some text\n-​
```

```diff
- here is a list
+ here is a list
```

```diff
- here is a list\n
+ here is a list\n
```

```diff
- This is a title\n=
+ This is a title\n=​
```

```diff
- This is a title\n==
+ This is a title\n==​
```

```diff
- This is a title\n===
+ This is a title\n===
```

```diff
- **bold text**\n-
+ **bold text**\n-​
```

```diff
- *italic text*\n-
+ *italic text*\n-​
```

```diff
- `code`\n-
+ `code`\n-​
```

```diff
- Text 1\n-\nText 2\n-
+ Text 1\n-\nText 2\n-​
```


---

## Leave list markers alone
```

<!-- +23 from remend/__tests__ -->



```diff
- - [ ] **bold task
+ - [ ] **bold task**
```

```diff
- - [ ] *italic task
+ - [ ] *italic task*
```

```diff
- - [ ] `code task
+ - [ ] `code task`
```

```diff
- * Single item
+ * Single item
```

```diff
- * Parent item\n  * Nested item 1\n  * Nested item 2
+ * Parent item\n  * Nested item 1\n  * Nested item 2
```

```diff
- * Item with *italic* text\n* Another item
+ * Item with *italic* text\n* Another item
```

```diff
- * Item with *incomplete italic\n* Another item
+ * Item with *incomplete italic\n* Another item
```

```diff
- * First item\n* Second *italic* item\n* Third item
+ * First item\n* Second *italic* item\n* Third item
```

```diff
- *\tItem with tab\n*\tAnother item
+ *\tItem with tab\n*\tAnother item
```

```diff
- - Item 1\n- Item 2 with *italic*\n- Item 3
+ - Item 1\n- Item 2 with *italic*\n- Item 3
```

```diff
- * user123\n* user456\n* user789
+ * user123\n* user456\n* user789
```

```diff
- - __\n- **
+ - __\n- **
```

```diff
- \n- __\n- **
+ \n- __\n- **
```

```diff
- * __\n* **
+ * __\n* **
```

```diff
- + __\n+ **
+ + __\n+ **
```

```diff
- - __ text after
+ - __ text after
```

```diff
- - ** text after
+ - ** text after
```

```diff
- - __\n- Normal item\n- **
+ - __\n- Normal item\n- **
```

```diff
- - *
+ - *
```

```diff
- - _
+ - _
```

```diff
- - `
+ - `
```

```diff
- - **text\nmore text
+ - **text\nmore text
```

```diff
- * **content\n* Another item
+ * **content\n* Another item
```


---

## Leave code fences alone
```

<!-- +49 from remend/__tests__ -->



```diff
- ```\ncode\n```\n*italic
+ ```\ncode\n```\n*italic*
```

```diff
-     *asterisks in indented
+     *asterisks in indented*
```

```diff
-     **bold in indented
+     **bold in indented**
```

```diff
- ```\ncode\n```\n**bold
+ ```\ncode\n```\n**bold**
```

```diff
- ```\ncode\n```\n```\nmore
+ ```\ncode\n```\n```\nmore
```

```diff
- ```\ncode here
+ ```\ncode here
```

```diff
- ```javascript\nconst x = 5;\n```
+ ```javascript\nconst x = 5;\n```
```

```diff
- ```python\ndef hello():
+ ```python\ndef hello():
```

```diff
- ```\nconst str = `template`;\n```
+ ```\nconst str = `template`;\n```
```

```diff
- Some text\n```js\nconsole.log
+ Some text\n```js\nconsole.log
```

```diff
- ```\ncode\n```\nMore text
+ ```\ncode\n```\nMore text
```

```diff
- ```python\ndef greet(name):\n    return f"Hello, {name}!"\n```
+ ```python\ndef greet(name):\n    return f"Hello, {name}!"\n```
```

```diff
- ```python\ndef greet(name):\n    return f"Hello, {name}!"\n```\n
+ ```python\ndef greet(name):\n    return f"Hello, {name}!"\n```\n
```

```diff
- ```\nSimple code block\nwith multiple lines\nand some special characters: !@#$%^&*()\n```
+ ```\nSimple code block\nwith multiple lines\nand some special characters: !@#$%^&*()\n```
```

```diff
- ```python\ndef hello_world():\n    """A simple function"""\n    name = "World"\n    print(f"Hello, {name}!")\n    \n    # List comprehension\n    numbers = [x**2 for x in range(10) if x % 2 == 0]\n    return numbers\n\nclass TestClass:\n    def __init__(self, value):\n        self.value = value\n```
+ ```python\ndef hello_world():\n    """A simple function"""\n    name = "World"\n    print(f"Hello, {name}!")\n    \n    # List comprehension\n    numbers = [x**2 for x in range(10) if x % 2 == 0]\n    return numbers\n\nclass TestClass:\n    def __init__(self, value):\n        self.value = value\n```
```

```diff
- ```python def greet(name): return f"Hello, {name}!"\n```
+ ```python def greet(name): return f"Hello, {name}!"\n```
```

```diff
- ```js\ncode1\n```\n\n```python\ncode2\n```
+ ```js\ncode1\n```\n\n```python\ncode2\n```
```

```diff
- ```python code```
+ ```python code```
```

```diff
- ```python code\n```
+ ```python code\n```
```

```diff
- Here's some code:\n```javascript\nconst arr = [1, 2, 3];\nconsole.log(arr[0]);\n```\nDone with code block.
+ Here's some code:\n```javascript\nconst arr = [1, 2, 3];\nconsole.log(arr[0]);\n```\nDone with code block.
```

```diff
- Precisely.\n\nWhen full-screen TUI applications like **Vim**, **less**, or **htop** start, they switch the terminal into what's called the **alternate screen buffer**—a second, temporary display area separate from the main scrollback buffer.\n\n### How it works\nThey send ANSI escape sequences such as:\n```bash\n# Enter alternate screen buffer\necho -e "\\e[?1049h"\n\n# Exit (back to normal buffer)\necho -e "\\e[?1049l"\n```\n\n- `\\e[?1049h` — activates the alternate screen.\n- `\\e[?1049l` — deactivates it and restores the previous view.\n\nWhile in this mode:\n- The "scrollback" (your regular terminal history) is hidden.\n- The program gets a fresh, empty screen to draw on.\n- When the program exits, the screen restores exactly as it was before.\n\n### tmux behavior\n`tmux` respects these escape sequences by default. When apps use the alternate buffer, tmux holds that screen separately from the main one. That's why, when you scroll in tmux during Vim, you don't see your shell history—you have to leave Vim first.\n\nIf someone wants to **disable** this behavior (so the app draws on the main screen and you can scroll back freely), they can set:\n```bash\nset -g terminal-overrides 'xterm*:smcup@:rmcup@'\n```\nin their `~/.tmux.conf`, which disables use of the alternate buffer entirely.\n\nWould you like me to show how to conditionally toggle that behavior per app or session?
+ Precisely.\n\nWhen full-screen TUI applications like **Vim**, **less**, or **htop** start, they switch the terminal into what's called the **alternate screen buffer**—a second, temporary display area separate from the main scrollback buffer.\n\n### How it works\nThey send ANSI escape sequences such as:\n```bash\n# Enter alternate screen buffer\necho -e "\\e[?1049h"\n\n# Exit (back to normal buffer)\necho -e "\\e[?1049l"\n```\n\n- `\\e[?1049h` — activates the alternate screen.\n- `\\e[?1049l` — deactivates it and restores the previous view.\n\nWhile in this mode:\n- The "scrollback" (your regular terminal history) is hidden.\n- The program gets a fresh, empty screen to draw on.\n- When the program exits, the screen restores exactly as it was before.\n\n### tmux behavior\n`tmux` respects these escape sequences by default. When apps use the alternate buffer, tmux holds that screen separately from the main one. That's why, when you scroll in tmux during Vim, you don't see your shell history—you have to leave Vim first.\n\nIf someone wants to **disable** this behavior (so the app draws on the main screen and you can scroll back freely), they can set:\n```bash\nset -g terminal-overrides 'xterm*:smcup@:rmcup@'\n```\nin their `~/.tmux.conf`, which disables use of the alternate buffer entirely.\n\nWould you like me to show how to conditionally toggle that behavior per app or session?
```

```diff
- ```css\n/* Commentary */\n\n[class*="WidgetTitle__Header"] {\n  font-size: 18px !important;\n}\n```\n\nNotes and tips:\n* Use !important only where necessary in CSS.
+ ```css\n/* Commentary */\n\n[class*="WidgetTitle__Header"] {\n  font-size: 18px !important;\n}\n```\n\nNotes and tips:\n* Use !important only where necessary in CSS.
```

```diff
- ```python\ndef __init__(self):\n    pass\n```\n\n* List item
+ ```python\ndef __init__(self):\n    pass\n```\n\n* List item
```

```diff
- Here's some code:\n```javascript\nconst my__variable = "test";\nconst another_var = 5;\n```\n\nSome notes:\n* First note\n* Second note
+ Here's some code:\n```javascript\nconst my__variable = "test";\nconst another_var = 5;\n```\n\nSome notes:\n* First note\n* Second note
```

```diff
- Here's a state diagram:\n\n```mermaid\nstateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading: fetch()\n    Loading --> Success: 200 OK\n    Loading --> Error: 4xx/5xx\n    Error --> Loading: retry()\n    Success --> Idle: reset()\n```
+ Here's a state diagram:\n\n```mermaid\nstateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading: fetch()\n    Loading --> Success: 200 OK\n    Loading --> Error: 4xx/5xx\n    Error --> Loading: retry()\n    Success --> Idle: reset()\n```
```

```diff
- Here's a state diagram:\n\n```mermaid\nstateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading: fetch()
+ Here's a state diagram:\n\n```mermaid\nstateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading: fetch()
```

```diff
- *Note:* Here's a state diagram:\n\n```mermaid\nstateDiagram-v2\n    [*] --> Idle\n```
+ *Note:* Here's a state diagram:\n\n```mermaid\nstateDiagram-v2\n    [*] --> Idle\n```
```

```diff
- ```mermaid\nstateDiagram-v2\n    [*] --> Idle\n```\n\nHere is *incomplete italic
+ ```mermaid\nstateDiagram-v2\n    [*] --> Idle\n```\n\nHere is *incomplete italic*
```

```diff
- ```\n***bold
+ ```\n***bold
```

```diff
- ```\n***\n```\n***text
+ ```\n***\n```\n***text***
```

```diff
- ```\n_code\n```\n_text
+ ```\n_code\n```\n_text_
```

```diff
- ```\n__code\n```\n__text
+ ```\n__code\n```\n__text__
```

```diff
- ```\n__content_
+ ```\n__content_
```

```diff
- ~~~\ncode with __stuff\n~~~\ndone
+ ~~~\ncode with __stuff\n~~~\ndone
```

```diff
- ~~~js\nx = a__b
+ ~~~js\nx = a__b
```

```diff
- ~~~\ncode\n~~~\nafter ~~open
+ ~~~\ncode\n~~~\nafter ~~open~~
```

```diff
- prose ~~struck~~ more prose __bold
+ prose ~~struck~~ more prose __bold__
```

```diff
-    ```\n__code\n   ```\n__open
+    ```\n__code\n   ```\n__open__
```

```diff [valid]
- see ```inline code``
+ see ```inline code```
```

```diff [valid]
- ````\ncode\n```\nstill __code
+ ````\ncode\n```\nstill __code
```

```diff
- ```\ncode\n````\nafter __bold
+ ```\ncode\n````\nafter __bold__
```

```diff
- ```python__hint\ncode
+ ```python__hint\ncode
```

```diff
- `a``
+ `a``
```

```diff
- 1.  Install:\n    ```bash\n    npm install foo
+ 1.  Install:\n    ```bash\n    npm install foo
```

```diff
- - step\n  - nested\n    ```js\n    const x = a__b
+ - step\n  - nested\n    ```js\n    const x = a__b
```

```diff
- ```js\r\nconst a = 1
+ ```js\r\nconst a = 1
```

```diff
- ```\r\ncode\r\n```\r\n__open
+ ```\r\ncode\r\n```\r\n__open__
```

```diff
- use ``` to open a block\n\nmore **bold streaming
+ use ``` to open a block\n\nmore **bold streaming**
```

```diff
- intro\n\nrun `npm i
+ intro\n\nrun `npm i`
```


---

## Leave horizontal rules alone
```

<!-- +29 from remend/__tests__ -->



```diff
- ----
+ ----
```

```diff
- -----
+ -----
```

```diff
- *****
+ *****
```

```diff
- ____
+ ____
```

```diff
- _____
+ _____
```

```diff
- - - -
+ - - -
```

```diff
- * * *
+ * * *
```

```diff
- _ _ _
+ _ _ _
```

```diff
- -  -  -
+ -  -  -
```

```diff
- *   *   *
+ *   *   *
```

```diff
- _    _    _
+ _    _    _
```

```diff
- Text before\n___\nText after
+ Text before\n___\nText after
```

```diff
- Some text\n\n***
+ Some text\n\n***
```

```diff
- Some text\n\n___
+ Some text\n\n___
```

```diff
- ---\n\nSome text
+ ---\n\nSome text
```

```diff
- ***\n\nSome text
+ ***\n\nSome text
```

```diff
- ___\n\nSome text
+ ___\n\nSome text
```

```diff
- Section 1\n\n---\n\nSection 2\n\n---\n\nSection 3
+ Section 1\n\n---\n\nSection 2\n\n---\n\nSection 3
```

```diff
- Text with --
+ Text with --
```

```diff
- - Item 1\n- Item 2\n\n---\n\nNew section
+ - Item 1\n- Item 2\n\n---\n\nNew section
```

```diff
- ---\n\n# Heading
+ ---\n\n# Heading
```

```diff
- --
+ --
```

```diff
- Text\n\n--
+ Text\n\n--
```

```diff
-    ---
+    ---
```

```diff
-   ***
+   ***
```

```diff
-  ___
+  ___
```

```diff
- This is not a --- horizontal rule
+ This is not a --- horizontal rule
```

```diff
- Text\n***
+ Text\n***
```

```diff
- # Title\n\nSome content with **bold** text.\n\n---\n\n## Section 2\n\nMore content.
+ # Title\n\nSome content with **bold** text.\n\n---\n\n## Section 2\n\nMore content.
```


---

## Word-internal markers stay literal
```

<!-- +7 from remend/__tests__ -->



```diff
- foo*bar
+ foo*bar
```

```diff
- test*123*test
+ test*123*test
```

```diff [valid]
- *foo*bar*baz
+ *foo*bar*baz*
```

```diff [valid]
- *file*name*ext
+ *file*name*ext*
```

```diff [valid]
- before *a*b after *c
+ before *a*b after *c*
```

```diff
- *기울임*으로 *another
+ *기울임*으로 *another*
```

```diff
- *foo* bar*baz
+ *foo* bar*baz
```


---

## Math protects inner markers
```diff
- Text with [link and **bold
+ Text with [link and **bold](comark:incomplete-link)
+ Text with [link and **bold](comark:incomplete-link)
```

<!-- +7 from remend/__tests__ -->



```diff
- > > **deeply nested bold
+ > > **deeply nested bold**
```

```diff
- > * list with **bold
+ > * list with **bold**
```

```diff
- > > > triple nested *italic
+ > > > triple nested *italic*
```

```diff
- **bold with *italic* inside**
+ **bold with *italic* inside**
```

```diff
- **bold with $x^2
+ **bold with $x^2**  (math: false)
```

```diff
- **bold with $x^2
+ **bold with $x^2$**  (math: true)
```

```diff
- **bold *italic* text** and `code`
+ **bold *italic* text** and `code`
```

```diff
- **_text
+ **_text_**
```


---

## Emphasis markers stay put inside code / escapes
```

<!-- +6 from remend/__tests__ -->



```diff
- \*not italic
+ \*not italic
```

```diff
- \\*actually italic
+ \\*actually italic*
```

```diff
- \**not bold
+ \**not bold*
```

```diff
- \*escaped\* but *real italic
+ \*escaped\* but *real italic*
```

```diff
- `$` _hello
+ `$` _hello_
```

```diff
- ```\nprice = $5\n```\n_hello
+ ```\nprice = $5\n```\n_hello_
```


---

## Trailing whitespace cleanup
```

<!-- +37 from remend/__tests__ -->



```diff
- 
+ 
```

```diff
- **bold\twith\ttabs
+ **bold\twith\ttabs**
```

```diff [valid]
- **bold\r\nwith CRLF
+ **bold\r\nwith CRLF**
```

```diff
- \n\n\n**bold
+ \n\n\n**bold**
```

```diff
- text 
+ text
```

```diff
- text  
+ text  
```

```diff
-  
+ 
```

```diff
- ](partial
+ ](partial
```

```diff
- Text ending with **
+ Text ending with **
```

```diff
- ``
+ ``
```

```diff
- __
+ __
```

```diff
- _
+ _
```

```diff
- ** __
+ ** __
```

```diff
- \n** __\n
+ \n** __\n
```

```diff
- ** 
+ **
```

```diff
-  **
+  **
```

```diff
-   **  
+   **  
```

```diff
- **text
+ **text**
```

```diff
- __text
+ __text__
```

```diff
- *text
+ *text*
```

```diff
- _text
+ _text_
```

```diff
- `text
+ `text`
```

```diff
- aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa **bold
+ aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa **bold**
```

```diff
- Text with \* escaped asterisk
+ Text with \* escaped asterisk
```

```diff
- text**
+ text**
```

```diff
- text`
+ text`
```

```diff
- text **bold
+ text **bold**
```

```diff
- text\n**bold
+ text\n**bold**
```

```diff
- text\t`code
+ text\t`code`
```

```diff
- **émoji 🎉
+ **émoji 🎉**
```

```diff
- `código
+ `código`
```

```diff
- **&lt;tag&gt;
+ **&lt;tag&gt;**
```

```diff
- `&amp;
+ `&amp;`
```

```diff
- 5 * 0
+ 5 * 0
```

```diff
- x * y
+ x * y
```

```diff
- a * b = c
+ a * b = c
```

```diff
- 2 * 3 * 4
+ 2 * 3 * 4
```


---

## Streaming chunks (progressive)
```diff
- Check out [this lin
+ Check out [this lin](comark:incomplete-link)
+ Check out [this lin](comark:incomplete-link)
```

```diff
- [Click here](https://
+ [Click here](comark:incomplete-link)
+ [Click here](comark:incomplete-link)
```

**Link (text-only):**
```

<!-- +17 from remend/__tests__ -->



```diff
- Here's how to use it:\n\n```typescript\nconst x = 1
+ Here's how to use it:\n\n```typescript\nconst x = 1
```

```diff
- 1. First\n2. **Second item with bold
+ 1. First\n2. **Second item with bold**
```

```diff
- The function `getData` returns a **Promise
+ The function `getData` returns a **Promise**
```

```diff
- ```js\nconst x = 1;\n```\n\nThis creates a **variable
+ ```js\nconst x = 1;\n```\n\nThis creates a **variable**
```

```diff
- - Use `map` to transform\n- Use `filter
+ - Use `map` to transform\n- Use `filter`
```

```diff
- ## Important *note
+ ## Important *note*
```

```diff
- [click here](https://example.com) for **more
+ [click here](https://example.com) for **more**
```

```diff
- This is **bold with *ital
+ This is **bold with *ital*
```

```diff
- **bold _und
+ **bold _und_**
```

```diff
- 1. First item\n   - Nested with `code\n2. Second
+ 1. First item\n   - Nested with `code\n2. Second
```

```diff
- Text **bold `code
+ Text **bold `code**`
```

```diff
- Here is
+ Here is
```

```diff
- Here is a **bold statement** about
+ Here is a **bold statement** about
```

```diff
- Here is a **bold statement** about `code`.
+ Here is a **bold statement** about `code`.
```

```diff
- To use this function
+ To use this function
```

```diff
- To use this function, call `getData(
+ To use this function, call `getData(`
```

```diff
- To use this function, call `getData()` with
+ To use this function, call `getData()` with
```


---

## Trailing openers (`dropTrailingOpeners: true`)
+ hello **bold**
```


---

# Remend package extras

Additional cases from `packages/remend/__tests__` not covered by the sections above.

---

## Remend extras

```diff
- text~
+ text~
```

```diff
- [link text
+ [link text  (links: false, images: false)
```


/**
 * Side-by-side SPEC comparison: remend (local) vs comark@0.7.0 autoCloseMarkdown
 * against every ```diff case in comark's SPEC/auto-close.md.
 * against every ```diff case in __fixtures__/auto-close.md
 * (comark SPEC + cases extracted from remend/__tests__).
 *
 * Placeholders differ by library and are rewritten before comparison:
 *   remend  → comark:incomplete-link / comark:incomplete-image
  note?: string;
  skip?: boolean;
  /** Options parsed from the SPEC note, e.g. `(linkMode: 'text-only')`. */
  noteOpts?: RemendOptions;
};

type Outcome = "pass" | "fail" | "unsupported" | "skip";
};

/** Decode SPEC side of a diff line: `\n` → newline; keep `\\` escapes as single `\`. */
/** Decode SPEC side of a diff line: `\n`/`\t`/`\r` only; other `\X` stay as `\X`. */
function decode(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
        continue;
      }
      if (n === "r") {
        out += "\r";
        i++;
        continue;
      }
      out += "\\";
      out += n;
      i++;
          note,
          skip,
          noteOpts: parseNoteOpts(note),
        });
      }
      i++;
  const base = optionsForSectionComark(c.section);

  // Map remend note opts onto comark AutoCloseOptions where possible.
  if (c.noteOpts?.linkMode) {
    base.linkMode = c.noteOpts.linkMode;
  }
  if (c.noteOpts?.inlineKatex === true || c.noteOpts?.katex === true) {
    base.math = true;
  }
  if (c.noteOpts?.katex === false && c.noteOpts?.inlineKatex !== true) {
    base.math = false;
  }

  if (/^(Block math|Inline math|Math protects)/i.test(c.section)) {
    if (
      /Inline math/i.test(c.section) &&
      return base;
    }
    return { ...base, math: true };
    return { ...base, math: base.math ?? true };
  }

  if (/Streaming chunks/i.test(c.section)) {
}

/** Parse notes like `linkMode: 'text-only', katex: false, inlineKatex: true`. */
function parseNoteOpts(note?: string): RemendOptions | undefined {
  if (!note) return undefined;
  const opts: RemendOptions = {};
  let found = false;

  for (const part of note.split(",")) {
    const m = part.trim().match(/^(\w+)\s*:\s*(.+)$/);
    if (!m) continue;
    const key = m[1];
    let raw = m[2].trim();
    if (
      (raw.startsWith("'") && raw.endsWith("'")) ||
      (raw.startsWith('"') && raw.endsWith('"'))
    ) {
      raw = raw.slice(1, -1);
    }
    let value: boolean | string;
    if (raw === "true") value = true;
    else if (raw === "false") value = false;
    else value = raw;

    switch (key) {
      case "linkMode":
        if (value === "protocol" || value === "text-only") {
          opts.linkMode = value;
          found = true;
        }
        break;
      case "bold":
      case "boldItalic":
      case "comparisonOperators":
      case "htmlTags":
      case "images":
      case "inlineCode":
      case "inlineKatex":
      case "italic":
      case "katex":
      case "links":
      case "setextHeadings":
      case "singleTilde":
      case "strikethrough":
        if (typeof value === "boolean") {
          opts[key] = value;
          found = true;
        }
        break;
      default:
        break;
    }
  }

  return found ? opts : undefined;
}

function optionsForCaseRemend(c: Case): RemendOptions {
  const base: RemendOptions = {};
  const base: RemendOptions = { ...(c.noteOpts ?? {}) };

  if (/text-only mode/i.test(c.section)) {
    base.linkMode = "text-only";
    base.linkMode ??= "text-only";
  }

  if (/Streaming chunks/i.test(c.section)) {
      !c.expected.includes("](")
    ) {
      base.linkMode = "text-only";
      base.linkMode ??= "text-only";
    }
  }

  if (/^(Block math|Math protects)/i.test(c.section)) {
    base.katex = true;
    base.inlineKatex = true;
    base.katex ??= true;
    base.inlineKatex ??= true;
  }

  if (/^Inline math/i.test(c.section)) {
    if (!(c.expected === c.input && /\$/.test(c.input))) {
      base.katex = true;
      base.inlineKatex = true;
      base.katex ??= true;
      base.inlineKatex ??= true;
    }
  }

    const k = tally(comarkResults);

    // Sanity: both libraries should pass the vast majority
    expect(r.pass).toBeGreaterThan(140);
    expect(k.pass).toBeGreaterThan(140);
    expect(r.rate).toBeGreaterThan(90);
    expect(k.rate).toBeGreaterThan(90);
    // Sanity: remend should match nearly all applicable SPEC cases
    // (comark may diverge on remend-only extras extracted from tests).
    expect(cases.length).toBeGreaterThan(500);
    expect(r.pass).toBeGreaterThan(500);
    expect(r.rate).toBeGreaterThan(95);
  });
});

const SPEC = readFileSync(join(root, "__fixtures__/auto-close.md"), "utf8");

/** Decode SPEC: `\n`/`\t`/`\r` only; other `\X` stay as `\X`. */
function decode(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
        continue;
      }
      if (n === "r") {
        out += "\r";
        i++;
        continue;
      }
      out += "\\";
      out += n;
      i++;
}

function parseNoteOpts(note) {
  if (!note) return undefined;
  const opts = {};
  let found = false;
  for (const part of note.split(",")) {
    const m = part.trim().match(/^(\w+)\s*:\s*(.+)$/);
    if (!m) continue;
    const key = m[1];
    let raw = m[2].trim();
    if (
      (raw.startsWith("'") && raw.endsWith("'")) ||
      (raw.startsWith('"') && raw.endsWith('"'))
    ) {
      raw = raw.slice(1, -1);
    }
    let value;
    if (raw === "true") value = true;
    else if (raw === "false") value = false;
    else value = raw;

    if (key === "linkMode" && (value === "protocol" || value === "text-only")) {
      opts.linkMode = value;
      found = true;
    } else if (typeof value === "boolean") {
      opts[key] = value;
      found = true;
    }
  }
  return found ? opts : undefined;
}

function parseSpec(md) {
  const cases = [];
  let section = "top";
      let input = null;
      let expected = null;
      let note;
      while (i < lines.length && lines[i].trim() !== "```") {
        const L = lines[i];
        if (L.startsWith("- ")) input = L.slice(2);
        else if (L.startsWith("+ ")) {
          expected = L.slice(2).replace(/\s{2,}\(.+\)$/, "");
          const rest = L.slice(2);
          const m = rest.match(/^(.*?)\s{2,}\((.+)\)$/);
          if (m) {
            expected = m[1];
            note = m[2];
          } else expected = rest;
        }
        i++;
      }
          input: decode(input),
          expected: decode(expected),
          note,
          noteOpts: parseNoteOpts(note),
        });
      }
      i++;

function remendOpts(c) {
  const base = {};
  if (/text-only mode/i.test(c.section)) base.linkMode = "text-only";
  const base = { ...(c.noteOpts ?? {}) };
  if (/text-only mode/i.test(c.section)) base.linkMode ??= "text-only";
  if (/Streaming chunks/i.test(c.section)) {
    if (
      c.input.includes("[") &&
      !c.expected.includes("](")
    ) {
      base.linkMode = "text-only";
      base.linkMode ??= "text-only";
    }
  }
  if (/^(Block math|Math protects)/i.test(c.section)) {
    base.katex = true;
    base.inlineKatex = true;
    base.katex ??= true;
    base.inlineKatex ??= true;
  }
  if (/^Inline math/i.test(c.section)) {
    if (!(c.expected === c.input && /\$/.test(c.input))) {
      base.katex = true;
      base.inlineKatex = true;
      base.katex ??= true;
      base.inlineKatex ??= true;
    }
  }
  // Trailing openers needs math off so bare $$ is not closed as a math block
  if (/Trailing openers/i.test(c.section)) {
    base.katex = false;
  }
function comarkOpts(c) {
  const base = { syntax: false };
  if (c.noteOpts?.linkMode) base.linkMode = c.noteOpts.linkMode;
  if (c.noteOpts?.inlineKatex === true || c.noteOpts?.katex === true) {
    base.math = true;
  }
  if (c.noteOpts?.katex === false && c.noteOpts?.inlineKatex !== true) {
    base.math = false;
  }
  if (/text-only mode/i.test(c.section)) return { ...base, linkMode: "text-only" };
  if (/Trailing openers/i.test(c.section))
    return { ...base, dropTrailingOpeners: true };
      return base;
    }
    return { ...base, math: true };
    return { ...base, math: base.math ?? true };
  }
  if (/Streaming chunks/i.test(c.section)) {
    if (
      .replaceAll(COMARK_IMAGE, REMEND_IMAGE);
  }
  return expected;
  return expected
    .replaceAll(REMEND_LINK, COMARK_LINK)
    .replaceAll(REMEND_IMAGE, COMARK_IMAGE);
}

const cases = parseSpec(SPEC);
}

const ITER_SUITE = 500;
const ITER_SUITE = 200;
const remendSuiteMs = timeMs(() => {
  for (const p of prepared) remend(p.input, p.remend);
}, ITER_SUITE);
const largeDoc = `# Large\n\n${"para with **bold** and *italic* and `code`.\n\n".repeat(100)}Incomplete **open and [link`;

const ITER_JOINED = 1000;
const ITER_JOINED = 500;
const remendJoinedMs = timeMs(() => remend(joinedAll), ITER_JOINED);
const comarkJoinedMs = timeMs(
  () => autoCloseMarkdown(joinedAll, { syntax: false }),
p("# remend vs comark autoCloseMarkdown");
p();
p(`SPEC cases: **${cases.length}** (from comark SPEC/auto-close.md)`);
p(`SPEC cases: **${cases.length}** (from \`__fixtures__/auto-close.md\`)`);
p(`Node ${process.version}`);
p();
p("## Correctness");
  p("<details><summary>remend failure details</summary>");
  p();
  for (const f of remendFails) {
  for (const f of remendFails.slice(0, 50)) {
    p(`#### ${f.section}`);
    p("```");
    p(`input:    ${JSON.stringify(f.input)}`);
    p();
  }
  if (remendFails.length > 50) {
    p(`… and ${remendFails.length - 50} more`);
    p();
  }
  p("</details>");
  p();
}
  }
  p();
  p("<details><summary>comark failure details</summary>");
  p("<details><summary>comark failure details (first 50)</summary>");
  p();
  for (const f of comarkFails) {
  for (const f of comarkFails.slice(0, 50)) {
    p(`#### ${f.section}`);
    p("```");
    p(`input:    ${JSON.stringify(f.input)}`);
    p();
  }
  if (comarkFails.length > 50) {
    p(`… and ${comarkFails.length - 50} more`);
    p();
  }
  p("</details>");
  p();
}
    "build": "tsup",
    "compare:auto-close": "node scripts/compare-auto-close.mjs",
        "extract:auto-close": "node scripts/extract-remend-cases.mjs",
    "test": "vitest run",
    "test:auto-close-spec": "vitest run --config vitest.auto-close-spec.config.ts",
    "test:coverage": "vitest --coverage run",
/**
 * Extract remend(input) → expected pairs from packages/remend/__tests__
 * and merge new ones into __fixtures__/auto-close.md (SPEC ```diff format).
 *
 * Usage (from packages/remend, after build):
 *   node scripts/extract-remend-cases.mjs
 *
 * Re-download the comark base first if you want a clean merge:
 *   curl -sL https://raw.githubusercontent.com/comarkdown/comark/main/packages/comark/SPEC/auto-close.md \
 *     -o __fixtures__/auto-close.md
 *   node scripts/extract-remend-cases.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const testsDir = join(root, "__tests__");
const fixturePath = join(root, "__fixtures__/auto-close.md");
const COMARK_SPEC_URL =
  "https://raw.githubusercontent.com/comarkdown/comark/main/packages/comark/SPEC/auto-close.md";

const SKIP_FILES = new Set([
  "auto-close-spec.test.ts",
  "streaming-properties.test.ts",
  "utils.test.ts",
  "code-block-utils.test.ts",
  "custom-handlers.test.ts",
]);

const remendMod = await import(pathToFileURL(join(root, "dist/index.js")).href);
const remend = remendMod.default;

// ---------- TS literal evaluator ----------

function evalNode(node, src, locals = new Map()) {
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      return node.text;

    case ts.SyntaxKind.TemplateExpression: {
      let out = node.head.text;
      for (const span of node.templateSpans) {
        const v = evalNode(span.expression, src, locals);
        if (v === undefined) return undefined;
        out += String(v) + span.literal.text;
      }
      return out;
    }

    case ts.SyntaxKind.NumericLiteral:
      return Number(node.text);
    case ts.SyntaxKind.TrueKeyword:
      return true;
    case ts.SyntaxKind.FalseKeyword:
      return false;
    case ts.SyntaxKind.NullKeyword:
      return null;
    case ts.SyntaxKind.UndefinedKeyword:
      return undefined;

    case ts.SyntaxKind.Identifier: {
      if (locals.has(node.text)) return locals.get(node.text);
      return undefined;
    }

    case ts.SyntaxKind.ObjectLiteralExpression: {
      const obj = {};
      for (const prop of node.properties) {
        if (!ts.isPropertyAssignment(prop)) return undefined;
        obj[prop.name.getText(src)] = evalNode(prop.initializer, src, locals);
      }
      return obj;
    }

    case ts.SyntaxKind.ArrayLiteralExpression: {
      const arr = [];
      for (const el of node.elements) {
        arr.push(evalNode(el, src, locals));
      }
      return arr;
    }

    case ts.SyntaxKind.AsExpression:
    case ts.SyntaxKind.ParenthesizedExpression:
    case ts.SyntaxKind.TypeAssertionExpression:
      return evalNode(node.expression, src, locals);

    case ts.SyntaxKind.PrefixUnaryExpression: {
      const v = evalNode(node.operand, src, locals);
      if (v === undefined) return undefined;
      if (node.operator === ts.SyntaxKind.MinusToken) return -v;
      if (node.operator === ts.SyntaxKind.PlusToken) return +v;
      if (node.operator === ts.SyntaxKind.ExclamationToken) return !v;
      return undefined;
    }

    case ts.SyntaxKind.BinaryExpression: {
      const left = evalNode(node.left, src, locals);
      const right = evalNode(node.right, src, locals);
      if (left === undefined || right === undefined) return undefined;
      switch (node.operatorToken.kind) {
        case ts.SyntaxKind.PlusToken:
          return left + right;
        case ts.SyntaxKind.MinusToken:
          return left - right;
        case ts.SyntaxKind.AsteriskToken:
          return left * right;
        default:
          return undefined;
      }
    }

    case ts.SyntaxKind.CallExpression: {
      if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "repeat"
      ) {
        const base = evalNode(node.expression.expression, src, locals);
        const n = evalNode(node.arguments[0], src, locals);
        if (typeof base === "string" && typeof n === "number") {
          return base.repeat(n);
        }
      }
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === "incompleteImage"
      ) {
        const alt = evalNode(node.arguments[0], src, locals);
        if (typeof alt === "string") {
          return `![${alt}](comark:incomplete-image)`;
        }
      }
      return undefined;
    }

    case ts.SyntaxKind.PropertyAccessExpression: {
      const obj = evalNode(node.expression, src, locals);
      if (obj && typeof obj === "object") return obj[node.name.text];
      return undefined;
    }

    case ts.SyntaxKind.ElementAccessExpression: {
      const obj = evalNode(node.expression, src, locals);
      const key = evalNode(node.argumentExpression, src, locals);
      if (obj != null && key !== undefined) return obj[key];
      return undefined;
    }

    default:
      return undefined;
  }
}

function getExpectToBe(node) {
  if (!ts.isCallExpression(node)) return null;
  if (!ts.isPropertyAccessExpression(node.expression)) return null;
  if (
    node.expression.name.text !== "toBe" &&
    node.expression.name.text !== "toEqual"
  ) {
    return null;
  }
  const expectCall = node.expression.expression;
  if (!ts.isCallExpression(expectCall)) return null;
  if (
    !ts.isIdentifier(expectCall.expression) ||
    expectCall.expression.text !== "expect"
  ) {
    return null;
  }
  return {
    expectArg: expectCall.arguments[0],
    expectedNode: node.arguments[0],
  };
}

function isRemendCall(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "remend"
  );
}

function extractFromFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
  const file = filePath.split("/").pop();
  const cases = [];

  function walk(node, locals, describeStack) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      (node.expression.text === "describe" || node.expression.text === "it")
    ) {
      const titleNode = node.arguments[0];
      const title =
        titleNode &&
        (ts.isStringLiteral(titleNode) ||
          ts.isNoSubstitutionTemplateLiteral(titleNode))
          ? titleNode.text
          : null;
      const nextStack =
        node.expression.text === "describe" && title
          ? [...describeStack, title]
          : describeStack;
      const cb = node.arguments[1];
      if (cb && (ts.isArrowFunction(cb) || ts.isFunctionExpression(cb))) {
        if (cb.body) walk(cb.body, new Map(locals), nextStack);
        return;
      }
    }

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          const v = evalNode(decl.initializer, sf, locals);
          if (v !== undefined) {
            locals.set(decl.name.text, v);
          } else if (isRemendCall(decl.initializer)) {
            const input = evalNode(decl.initializer.arguments[0], sf, locals);
            const opts = decl.initializer.arguments[1]
              ? evalNode(decl.initializer.arguments[1], sf, locals)
              : undefined;
            if (typeof input === "string") {
              locals.set(decl.name.text, { __remend: true, input, opts });
            }
          }
        }
      }
    }

    const pair = getExpectToBe(node);
    if (pair) {
      let input;
      let opts;
      const expected = evalNode(pair.expectedNode, sf, locals);

      if (isRemendCall(pair.expectArg)) {
        input = evalNode(pair.expectArg.arguments[0], sf, locals);
        opts = pair.expectArg.arguments[1]
          ? evalNode(pair.expectArg.arguments[1], sf, locals)
          : undefined;
      } else if (ts.isIdentifier(pair.expectArg)) {
        const bound = locals.get(pair.expectArg.text);
        if (bound?.__remend) {
          input = bound.input;
          opts = bound.opts;
        }
      }

      if (typeof input === "string" && typeof expected === "string") {
        if (!(opts && opts.handlers)) {
          cases.push({
            file,
            describePath: describeStack.join(" › "),
            input,
            expected,
            opts: opts && Object.keys(opts).length ? opts : undefined,
          });
        }
      }
    }

    ts.forEachChild(node, (child) => walk(child, locals, describeStack));
  }

  walk(sf, new Map(), []);
  return cases;
}

// ---------- Format / classify ----------

/**
 * SPEC lines only special-case `\n` / `\t` / `\r` (see decode). Existing
 * backslashes (e.g. GFM escapes like `\~`) are left as a single `\` so they
 * round-trip: file `\~` → string `\~`.
 */
function encodeSpec(s) {
  return s
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
}

function decodeSpec(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) {
      const n = s[i + 1];
      if (n === "n") {
        out += "\n";
        i++;
        continue;
      }
      if (n === "t") {
        out += "\t";
        i++;
        continue;
      }
      if (n === "r") {
        out += "\r";
        i++;
        continue;
      }
      // Preserve the backslash + next char (e.g. \~ stays \~).
      out += "\\";
      out += n;
      i++;
      continue;
    }
    out += s[i];
  }
  return out;
}

function optionsNote(opts) {
  if (!opts) return null;
  const parts = [];
  for (const [k, v] of Object.entries(opts)) {
    if (v === true) parts.push(`${k}: true`);
    else if (v === false) parts.push(`${k}: false`);
    else if (typeof v === "string") parts.push(`${k}: '${v}'`);
    else parts.push(`${k}: ${JSON.stringify(v)}`);
  }
  return parts.length ? parts.join(", ") : null;
}

function caseKey(c) {
  return `${c.input}\0${c.expected}\0${JSON.stringify(c.opts ?? null)}`;
}

function contentKey(input, expected) {
  return `${input}\0${expected}`;
}

function sectionForCase(c) {
  const d = `${c.describePath} ${c.file}`.toLowerCase();
  const inp = c.input;
  const exp = c.expected;

  if (c.opts?.linkMode === "text-only" || /text-only/.test(d)) {
    return "Links (text-only mode)";
  }
  if (
    exp.includes("incomplete-image") ||
    /image/.test(d) ||
    inp.includes("![")
  ) {
    if (
      exp.includes("incomplete-image") ||
      inp.includes("![") ||
      /image/.test(d)
    ) {
      return "Images";
    }
  }
  if (
    exp.includes("incomplete-link") ||
    (/link/.test(d) && (inp.includes("[") || exp.includes("[")))
  ) {
    return "Links (default protocol mode)";
  }
  if (c.opts?.inlineKatex === true) return "Inline math";
  if (c.opts?.katex === true || /katex|math/.test(d)) {
    if (/protect/.test(d)) return "Math protects inner markers";
    if (/inline/.test(d)) return "Inline math";
    if (/\$\$/.test(inp) || /block/.test(d) || c.opts?.katex) {
      return "Block math (KaTeX)";
    }
  }
  if (/single.?tilde|tilde escape/.test(d)) return "Single tilde escape";
  if (/strikethrough/.test(d) || (inp.includes("~~") && !/tilde/.test(d))) {
    return "Strikethrough";
  }
  if (/html/.test(d)) return "Incomplete HTML tags";
  if (/comparison/.test(d)) return "Comparison operators in lists";
  if (/setext/.test(d)) return "Setext heading guard";
  if (/horizontal|thematic/.test(d)) return "Leave horizontal rules alone";
  if (/code.?block|fence|fenced|mermaid/.test(d)) {
    return "Leave code fences alone";
  }
  if (/list/.test(d) && !/comparison/.test(d)) return "Leave list markers alone";
  if (/inline.?code/.test(d)) return "Inline code";
  if (/bold.?italic|triple/.test(d) || inp.includes("***")) {
    return "Bold + italic";
  }
  if (/bold/.test(d)) return "Bold";
  if (/italic|underscore/.test(d)) {
    if (/underscore|__/i.test(d) || inp.includes("_")) {
      return "Italic (underscore)";
    }
    return "Italic (asterisk)";
  }
  if (/intraword|word.?internal|space.?flank|multiply/.test(d)) {
    return "Word-internal markers stay literal";
  }
  if (/nested|mixed/.test(d)) return "Nested / mixed formatting";
  if (/escape|inside code/.test(d)) {
    return "Emphasis markers stay put inside code / escapes";
  }
  if (/stream|chunk|progressive|gpt/.test(d)) {
    return "Streaming chunks (progressive)";
  }
  if (/trail.*space|whitespace cleanup/.test(d)) {
    return "Trailing whitespace cleanup";
  }
  if (/edge|empty|finished|plain|standalone|basic/.test(d)) {
    return "Leave finished / empty cases alone";
  }
  if (/^```/m.test(inp) || inp.includes("```")) return "Leave code fences alone";
  if (inp.includes("~~")) return "Strikethrough";
  if (inp.includes("***")) return "Bold + italic";
  if (inp.includes("**")) return "Bold";
  if (inp.includes("__") || /_[a-zA-Z]/.test(inp)) return "Italic (underscore)";
  if (inp.includes("*")) return "Italic (asterisk)";
  if (inp.includes("`")) return "Inline code";
  if (inp.includes("$$")) return "Block math (KaTeX)";
  if (inp.includes("$")) return "Inline math";
  return "Remend extras";
}

function formatDiff(c) {
  const note = optionsNote(c.opts);
  const exp = note
    ? `+ ${encodeSpec(c.expected)}  (${note})`
    : `+ ${encodeSpec(c.expected)}`;
  return `\`\`\`diff\n- ${encodeSpec(c.input)}\n${exp}\n\`\`\``;
}

function parseExistingKeys(md) {
  const keys = new Set();
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === "```diff") {
      i++;
      let input = null;
      let expected = null;
      while (i < lines.length && lines[i].trim() !== "```") {
        const L = lines[i];
        if (L.startsWith("- ")) input = L.slice(2);
        else if (L.startsWith("+ ")) {
          expected = L.slice(2).replace(/\s{2,}\(.+\)$/, "");
        }
        i++;
      }
      if (input != null && expected != null) {
        keys.add(contentKey(decodeSpec(input), decodeSpec(expected)));
      }
    }
    i++;
  }
  return keys;
}

function listSections(md) {
  const titles = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^##\s+(.+)/);
    if (m) titles.push(m[1].trim());
  }
  return titles;
}

/**
 * Insert a block of markdown just before the next `## ` heading after
 * `## sectionTitle`, or before a trailing `---` separator if present.
 * Falls back to end of file.
 */
function insertBeforeNextSection(md, sectionTitle, block) {
  const header = `## ${sectionTitle}`;
  const start = md.indexOf(header);
  if (start === -1) return null;

  const afterHeader = start + header.length;
  // Find next section heading
  const rest = md.slice(afterHeader);
  const nextMatch = rest.match(/\n## /);
  let insertAt;
  if (nextMatch && nextMatch.index != null) {
    insertAt = afterHeader + nextMatch.index;
    // Prefer inserting before a --- separator that precedes the next ##
    const window = md.slice(Math.max(afterHeader, insertAt - 20), insertAt);
    const sep = window.lastIndexOf("\n---");
    if (sep !== -1) {
      insertAt = Math.max(afterHeader, insertAt - 20) + sep;
    }
  } else {
    insertAt = md.length;
  }

  const before = md.slice(0, insertAt).replace(/\s+$/, "");
  const after = md.slice(insertAt).replace(/^\s+/, "\n\n");
  return `${before}\n\n${block.trim()}\n${after}`;
}

function toRemendBase(md) {
  return md
    .replace(
      /^---[\s\S]*?---\n/,
      `---
# Behavioral SPEC for remend (streaming auto-close).
# Source: comark SPEC/auto-close.md + cases extracted from packages/remend/__tests__.
# Exercised by __tests__/auto-close-spec.test.ts and scripts/compare-auto-close.mjs
skip: true
---
`
    )
    .replaceAll("`comark:incomplete-link`", "`comark:incomplete-link`")
    .replaceAll("`comark:incomplete-image`", "`comark:incomplete-image`")
    .replaceAll("(comark:incomplete-link)", "(comark:incomplete-link)")
    .replaceAll("(comark:incomplete-image)", "(comark:incomplete-image)")
    .replaceAll("comark:incomplete-link", "comark:incomplete-link")
    .replaceAll("comark:incomplete-image", "comark:incomplete-image")
    .replace(
      /# Auto Close Markdown Spec(?! \(remend\))/,
      "# Auto Close Markdown Spec (remend)"
    )
    .replaceAll("autoCloseMarkdown", "remend")
    .replace(
      /options:[\s\S]*?(?=\n\n---)/,
      `options (remend):
- incompleteLinkPlaceholder: \`comark:incomplete-link\`
- incompleteImagePlaceholder: \`comark:incomplete-image\`
- katex / inlineKatex: auto-close \`$$…$$\` / \`$…$\` (inlineKatex defaults off)
- linkMode: \`protocol\` | \`text-only\`
- per-case overrides may appear as \`+ expected  (katex: true, linkMode: 'text-only')\`

comark-only (not implemented by remend):
- dropTrailingOpeners: drop a trailing opener after whitespace at EOF (\`hello *\` → \`hello\`)`
    );
}

// ---------- Main ----------

// Always start from fresh comark SPEC if available, else local file.
let baseMd;
try {
  const res = await fetch(COMARK_SPEC_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  baseMd = await res.text();
  console.log(`Fetched fresh SPEC from comark (${baseMd.length} bytes)`);
} catch (e) {
  console.warn(`Could not fetch comark SPEC (${e.message}); using local file`);
  baseMd = readFileSync(fixturePath, "utf8");
  // If local was previously merged, strip remend extras appendix + injected markers
  // by re-fetch is preferred. Strip common pollution:
  baseMd = baseMd
    .replace(/\n<!-- \+\d+ from remend\/__tests__ -->\n[\s\S]*?(?=\n---\n\n## |\n# Remend package extras|\n*$)/g, "\n")
    .replace(/\n# Remend package extras[\s\S]*$/g, "\n");
}

baseMd = toRemendBase(baseMd);

const files = readdirSync(testsDir).filter(
  (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !SKIP_FILES.has(f)
);

let all = [];
for (const f of files) {
  all.push(...extractFromFile(join(testsDir, f)));
}

const verified = [];
const mismatches = [];
for (const c of all) {
  let got;
  try {
    got = remend(c.input, c.opts);
  } catch (e) {
    mismatches.push({ ...c, got: String(e) });
    continue;
  }
  if (got === c.expected) verified.push(c);
  else mismatches.push({ ...c, got });
}

const seen = new Set();
const unique = [];
for (const c of verified) {
  const k = caseKey(c);
  if (seen.has(k)) continue;
  seen.add(k);
  unique.push(c);
}

const existingKeys = parseExistingKeys(baseMd);
const sectionTitles = listSections(baseMd);

const bySection = new Map();
const extras = [];
let already = 0;

for (const c of unique) {
  if (existingKeys.has(contentKey(c.input, c.expected))) {
    already++;
    continue;
  }
  existingKeys.add(contentKey(c.input, c.expected));
  const title = sectionForCase(c);
  if (sectionTitles.includes(title)) {
    if (!bySection.has(title)) bySection.set(title, []);
    bySection.get(title).push(c);
  } else {
    extras.push(c);
  }
}

let updated = baseMd;
let mergedCount = 0;

for (const [title, list] of bySection) {
  const block = [
    `<!-- +${list.length} from remend/__tests__ -->`,
    "",
    ...list.map(formatDiff),
  ].join("\n\n");
  const next = insertBeforeNextSection(updated, title, block);
  if (next) {
    updated = next;
    mergedCount += list.length;
  } else {
    extras.push(...list);
  }
}

if (extras.length) {
  const by = new Map();
  for (const c of extras) {
    const t = sectionForCase(c);
    if (!by.has(t)) by.set(t, []);
    by.get(t).push(c);
  }
  let appendix = "\n\n---\n\n# Remend package extras\n\n";
  appendix +=
    "Additional cases from `packages/remend/__tests__` not covered by the sections above.\n\n";
  for (const [title, list] of by) {
    appendix += `---\n\n## ${title}\n\n`;
    appendix += list.map(formatDiff).join("\n\n");
    appendix += "\n\n";
  }
  updated = updated.replace(/\s*$/, "\n") + appendix;
  mergedCount += extras.length;
}

if (!updated.endsWith("\n")) updated += "\n";
writeFileSync(fixturePath, updated);

const finalDiffs = (updated.match(/```diff/g) || []).length;

console.log(`Test files scanned:     ${files.length}`);
console.log(`Cases extracted:        ${all.length}`);
console.log(`Verified vs remend:     ${verified.length}`);
console.log(`Unique verified:        ${unique.length}`);
console.log(`Already in SPEC:        ${already}`);
console.log(`Newly merged:           ${mergedCount}`);
console.log(`Eval mismatches:        ${mismatches.length}`);
console.log(`Total SPEC diffs now:   ${finalDiffs}`);
console.log(`Wrote ${fixturePath}`);

if (mismatches.length) {
  console.log("\nSample mismatches (first 8):");
  for (const m of mismatches.slice(0, 8)) {
    console.log(`  [${m.file}] ${JSON.stringify(m.input).slice(0, 50)}`);
    console.log(`    exp ${JSON.stringify(m.expected).slice(0, 50)}`);
    console.log(`    got ${JSON.stringify(m.got).slice(0, 50)}`);
  }
}

if (bySection.size) {
  console.log("\nMerged into sections:");
  for (const [t, list] of bySection) console.log(`  ${t}: +${list.length}`);
}
if (extras.length) {
  console.log(`\nExtras appendix: ${extras.length}`);
}
