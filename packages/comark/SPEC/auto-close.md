---
# Behavioral SPEC for auto-close markdown (not a parse fixture).
# Skip the Input/AST/HTML runner.
skip: true
format: diff-cases/v2
---

# Auto Close Markdown Spec

Self-healing markdown for streaming. Completes incomplete syntax so partial AI output still renders cleanly and does not flash.

## Principles

1. **Attached markers close, detached markers stay literal.** `**bold` → `**bold**`; `hello **` and `5 * 0` are left alone. A marker followed by whitespace or EOF can never become syntax.
2. **Word-internal markers stay literal.** `snake_case`, `foo*bar`, `1_000_000` are never treated as openers. `_` additionally requires whitespace or line start before it (`func(_arg` stays literal); `*` follows CommonMark flanking rules.
3. **Close innermost first (LIFO).** Every unclosed construct is closed in reverse opening order: `` **bold *italic ~~strike `code `` → `` **bold *italic ~~strike `code`~~*** ``. A closer is never emitted inside a construct that was opened later.
4. **Code, math and fences shield their contents.** Nothing inside `` ` ``…`` ` ``, `$`…`$`, `$$`…`$$`, fenced or indented code is inspected or closed. An unclosed fence at EOF is left open on purpose (the renderer shows a streaming code block).
5. **Empty delimiter runs are never closed.** `**`, `- ~~`, `$$$`, `text**` stay as they are; there is no content to wrap.
6. **Block boundaries end inline scope.** Emphasis may span a soft line break inside one paragraph or list item, but never crosses a blank line, a new list item, a heading, a rule or a fence.
7. **Only streaming frames are altered where possible.** Closers, placeholders and guards are for the in-flight frame. Transforms that change final output (`singleTilde` escaping, `comparisonOperators` escaping, table delimiter insertion) are opt-out and documented as such.
8. **Streaming-only helpers.** `dropTrailingOpeners` and the setext guard exist to stop flicker and are enabled by `streaming: true`.

## Options

| option | default | effect |
| --- | --- | --- |
| `bold` | `true` | close `**…**` / `__…__` |
| `italic` | `true` | close `*…*` / `_…_` |
| `boldItalic` | `true` | close `***…***` / `___…___` |
| `inlineCode` | `true` | close `` `…` `` |
| `strikethrough` | `true` | close `~~…~~` |
| `links` | `true` | close `[text` / `[text](partial` using `incompleteLinkPlaceholder` |
| `images` | `true` | close `![alt` / `![alt](partial` using `incompleteImagePlaceholder` |
| `linkMode` | `'protocol'` | `'protocol'` emits `[text](placeholder)`; `'text-only'` strips the brackets and emits plain text. Images always use the image placeholder. |
| `incompleteLinkPlaceholder` | `'auto-close:incomplete-link'` | href used for incomplete links |
| `incompleteImagePlaceholder` | `'auto-close:incomplete-image'` | src used for incomplete images |
| `blockMath` | `true` | close `$$…$$` |
| `inlineMath` | `false` | close `$…$` (off by default: `$50 and $100` is prose) |
| `htmlTags` | `true` | drop an incomplete tag (`<div class=`) at EOF, including the whitespace before it |
| `tables` | `true` | append a delimiter row to a lone header row; complete a partial delimiter row (changes final output for non-table rows that happen to look like one) |
| `singleTilde` | `true` | escape lone `~` (`20~25` → `20\~25`) so GFM single-tilde strike cannot swallow prose (changes final output) |
| `comparisonOperators` | `true` | escape `>` followed by a digit at the start of a list item (`- > 25` → `- \> 25`) (changes final output) |
| `dropTrailingOpeners` | `false` (`true` when `streaming: true`) | drop a trailing opener after whitespace at EOF (`hello *` → `hello`) |
| `setextGuard` | `true` when `streaming: true` | append U+200B to a 1–2 char `-`/`=` line under a paragraph so it does not flash as a heading |

Legacy aliases accepted for one release: `katex` → `blockMath`, `math` and `inlineKatex` → `inlineMath`.

## Case format

Each case is a `diff` fence with one `-` line (input) and one `+` line (expected output). `\n`, `\r`, `\t` are literal escape sequences for the corresponding characters; every other character is verbatim (so trailing spaces on the `+` line are part of the expected output). Options for a single case go in the fence info string, never in the `+` line:

    ```diff opts="inlineMath: true, linkMode: 'text-only'"
    - Text with $formula
    + Text with $formula$
    ```

A U+200B (zero width space) in a `+` line is written literally; runners must compare code points, not normalised strings.

---
## Bold

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

```diff opts="bold: false"
- **bold text
+ **bold text
```

```diff opts="bold: false"
- **bold *italic
+ **bold *italic*
```

```diff opts="italic: false"
- **bold *italic
+ **bold *italic
```

---

## Italic (asterisk)

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

```diff
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

Underscore openers need whitespace or line start before them; `(` and other punctuation do not count, so these stay literal:

```diff
- func(_arg
+ func(_arg
```

```diff
- call foo(_private)
+ call foo(_private)
```

```diff
- (_parenthetical aside
+ (_parenthetical aside
```

```diff
- [link](url) (_note
+ [link](url) (_note
```

```diff
- \_fully\_escaped\_
+ \_fully\_escaped\_
```

```diff
- \_escaped\_ _complete_ pair
+ \_escaped\_ _complete_ pair
```

```diff
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

```diff
- ___both___ done
+ ___both___ done
```

```diff
- \___bold
+ \___bold__
```

---

## Bold + italic

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
+ ***bold-italic with `code`***
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

```diff
- ****text
+ ****text****
```

```diff
- *****text
+ *****text*****
```

```diff
- **bold and *bold-italic***
+ **bold and *bold-italic***
```

---

## Inline code

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

With the construct off nothing is closed — the delimiters stay literal:

```diff opts="inlineCode: false"
- `code
+ `code
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

```diff
- **bold then *italic then ~~strike
+ **bold then *italic then ~~strike~~***
```

```diff
- ~~strike **bold *italic
+ ~~strike **bold *italic*~~
```

```diff
- *italic **bold ~~strike `code
+ *italic **bold ~~strike `code`~~***
```

```diff
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

```diff
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

```diff opts="bold: false, italic: false, inlineCode: false, strikethrough: false, boldItalic: false"
- **bold *italic `code ~~strike
+ **bold *italic `code ~~strike
```

```diff opts="bold: false"
- **bold ~~strike
+ **bold ~~strike~~
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

```diff
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

```diff opts="singleTilde: false"
- 20~25°C
+ 20~25°C
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
+ Text with [incomplete link](auto-close:incomplete-link)
```

```diff
- Visit [our site](https://exa
+ Visit [our site](auto-close:incomplete-link)
```

```diff
- [outer [nested] text](incomplete
+ [outer [nested] text](auto-close:incomplete-link)
```

```diff
- Text [outer [inner
+ Text [outer [inner](auto-close:incomplete-link)
```

```diff
- [link1 and [link2
+ [link1 and [link2](auto-close:incomplete-link)
```

```diff
- [first](url1) and [second
+ [first](url1) and [second](auto-close:incomplete-link)
```

```diff
- [outer [inner]
+ [outer [inner]](auto-close:incomplete-link)
```

```diff
- [**bold link**](incomplete-url
+ [**bold link**](auto-close:incomplete-link)
```

```diff
- [*italic link*](incomplete
+ [*italic link*](auto-close:incomplete-link)
```

```diff
- [`code link`](incomplete
+ [`code link`](auto-close:incomplete-link)
```

```diff
- [**bold link
+ [**bold link](auto-close:incomplete-link)
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
+ [text](auto-close:incomplete-link)
```

```diff
- [^1]: footnote text
+ [^1]: footnote text
```

```diff
- [link text
+ [link text](auto-close:incomplete-link)
```

An empty label stays literal (SPEC principle 5 — nothing to wrap):

```diff
- see [
+ see [
```

```diff opts="linkMode: 'text-only'"
- see [
+ see [
```

```diff
- Check the [documentation
+ Check the [documentation](auto-close:incomplete-link)
```

```diff
- Here's a code block:\n```bash\necho "test"\n```\nAnd here's an [incomplete link
+ Here's a code block:\n```bash\necho "test"\n```\nAnd here's an [incomplete link](auto-close:incomplete-link)
```

```diff
- [link](a_b) _word
+ [link](a_b) _word_
```

```diff
- Text [partial
+ Text [partial](auto-close:incomplete-link)
```

```diff
- [link1](url1) and [link2](url2)
+ [link1](url1) and [link2](url2)
```

```diff
- [link with [inner] content](http://incomplete
+ [link with [inner] content](auto-close:incomplete-link)
```

```diff
- Text [foo [bar] baz](
+ Text [foo [bar] baz](auto-close:incomplete-link)
```

```diff
- [link with [brackets] inside](https://example.com)
+ [link with [brackets] inside](https://example.com)
```

```diff
- [foo [bar [baz
+ [foo [bar [baz](auto-close:incomplete-link)
```

```diff
- Text [outer [inner]
+ Text [outer [inner]](auto-close:incomplete-link)
```

```diff
- [link [nested] text
+ [link [nested] text](auto-close:incomplete-link)
```

---

## Links (text-only mode)

```diff opts="linkMode: 'text-only'"
- [incomplete link
+ incomplete link
```

```diff opts="linkMode: 'text-only'"
- [link1 and [link2
+ link1 and link2
```

```diff opts="linkMode: 'text-only'"
- ![img [text
+ ![img text](auto-close:incomplete-image)
```

```diff opts="linkMode: 'text-only'"
- [link](url) [incomplete
+ [link](url) incomplete
```

```diff opts="linkMode: 'text-only'"
- [text] [incomplete
+ [text] incomplete
```

```diff opts="linkMode: 'text-only'"
- [a]( b](c [incomplete
+ [a]( b](c incomplete
```

```diff opts="linkMode: 'text-only'"
- Text [partial
+ Text partial
```

```diff opts="linkMode: 'text-only'"
- [link with [inner] content](http://incomplete
+ link with [inner] content
```

```diff opts="linkMode: 'text-only'"
- Text [foo [bar] baz](
+ Text foo [bar] baz
```

```diff opts="linkMode: 'text-only'"
- Text [outer [inner
+ Text outer inner
```

```diff opts="linkMode: 'text-only'"
- [foo [bar [baz
+ foo bar baz
```

```diff opts="linkMode: 'text-only'"
- Text [outer [inner]
+ Text outer [inner]
```

```diff opts="linkMode: 'text-only'"
- [link [nested] text
+ link [nested] text
```

```diff opts="linkMode: 'text-only'"
- Text ![incomplete image
+ Text ![incomplete image](auto-close:incomplete-image)
```

---

## Images

```diff
- Text with ![incomplete image
+ Text with ![incomplete image](auto-close:incomplete-image)
```

```diff
- Text with ![incomplete image]
+ Text with ![incomplete image](auto-close:incomplete-image)
```

```diff
- ![partial
+ ![partial](auto-close:incomplete-image)
```

An empty label is a half-typed marker, not an image — there is nothing to wrap:

```diff
- ![]
+ ![]
```

```diff
- see ![
+ see ![
```

```diff
- ![logo](./assets/log
+ ![logo](auto-close:incomplete-image)
```

```diff
- Text ![outer [inner]
+ Text ![outer [inner]](auto-close:incomplete-image)
```

Still uses image placeholder even in link text-only mode:

```diff
- Text ![alt](http://partial
+ Text ![alt](auto-close:incomplete-image)
```

```diff
- Here's the diagram:\n\n![architecture
+ Here's the diagram:\n\n![architecture](auto-close:incomplete-image)
```

```diff
- See ![diagram](http://example.com/img
+ See ![diagram](auto-close:incomplete-image)
```

```diff
- [link](url) _word
+ [link](url) _word_
```

```diff
- See ![the diag
+ See ![the diag](auto-close:incomplete-image)
```

```diff
- ![nested [brackets] text
+ ![nested [brackets] text](auto-close:incomplete-image)
```

```diff
- Start ![foo [bar] baz
+ Start ![foo [bar] baz](auto-close:incomplete-image)
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

```diff opts="blockMath: false"
- $$formula
+ $$formula
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
+ Math expression $x_
```

```diff opts="inlineMath: true"
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
- auto-close uses double dollar signs (`$$`) to delimit mathematical expressions.
+ auto-close uses double dollar signs (`$$`) to delimit mathematical expressions.
```

```diff
- Use `$$` for math blocks and `$$formula$$` for inline.
+ Use `$$` for math blocks and `$$formula$$` for inline.
```

```diff
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

Closes unclosed `$…$` only when `inlineMath: true` (default `false`, because `$50 and $100` is ordinary prose).

```diff opts="inlineMath: true"
- Text with $formula
+ Text with $formula$
```

```diff opts="inlineMath: true"
- $first$ and $second
+ $first$ and $second$
```

```diff opts="inlineMath: true"
- $$block$$ and $inline
+ $$block$$ and $inline$
```

Default (`inlineMath` unset / `false`) leaves inline math alone:

```diff
- Text with $formula
+ Text with $formula
```

```diff
- text234$
+ text234$
```

```diff opts="inlineMath: true, dropTrailingOpeners: true"
- text123$
+ text123
```

```diff opts="inlineMath: true"
- text$d
+ text$d$
```

```diff opts="inlineMath: true"
- $x^2 + y^2
+ $x^2 + y^2$
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
+ $$$
```

```diff
- $$$$
+ $$$$
```

```diff
- $$ $$
+ $$ $$
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

```diff opts="inlineMath: true"
- $incomplete
+ $incomplete$
```

```diff opts="inlineMath: true"
- The formula $E
+ The formula $E$
```

```diff opts="inlineMath: true"
- The formula $E = mc
+ The formula $E = mc$
```

```diff opts="inlineMath: true"
- The formula $E = mc^2
+ The formula $E = mc^2$
```

```diff opts="inlineMath: true"
- Use `$var` for variables and $formula
+ Use `$var` for variables and $formula$
```

```diff opts="inlineMath: true"
- Inline $x$ and block $$y$$
+ Inline $x$ and block $$y$$
```

```diff opts="inlineMath: true"
- $$block$$ then $x + y
+ $$block$$ then $x + y$
```

---

## Incomplete HTML tags

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

```diff
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

```diff
- <a target="_blank" href="https://link.com">word</a>
+ <a target="_blank" href="https://link.com">word</a>
```

```diff
- <a target="_blank">link</a>
+ <a target="_blank">link</a>
```

```diff
- <iframe src="x" sandbox="allow_scripts">
+ <iframe src="x" sandbox="allow_scripts">
```

```diff opts="htmlTags: false"
- Hello <div
+ Hello <div
```

---

## Comparison operators in lists

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

```diff opts="comparisonOperators: false"
- - > 25: rich
+ - > 25: rich
```

```diff
- - > 25: **bold
+ - \> 25: **bold**
```

---

## Setext heading guard

A 1–2 character `-` or `=` line directly under paragraph text gets a trailing U+200B so it cannot flash as a setext heading while a list marker, rule or heading underline is still being typed. Three or more characters are treated as intent and left alone.

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
- Some text\n--
+ Some text\n--​
```

```diff
- Some text\n---
+ Some text\n---
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

## Tables

A lone header row is completed with a delimiter row so it renders as a table immediately; a partially streamed delimiter row is finished; complete tables are untouched.

```diff
- | **bold** | next |
+ | **bold** | next |\n| --- | --- |
```

```diff
- | `code` | next |
+ | `code` | next |\n| --- | --- |
```

```diff
- | a | b |\n| --
+ | a | b |\n| --- | --- |
```

```diff
- | a | b |\n| --- |
+ | a | b |\n| --- | --- |
```

```diff
- | a | b |\n| --- | --- |
+ | a | b |\n| --- | --- |
```

```diff
- | a | b |\n| --- | --- |\n| 1 | 2 |
+ | a | b |\n| --- | --- |\n| 1 | 2 |
```

```diff
- | a | b |\n| --- | --- |\n| 1 | **bo
+ | a | b |\n| --- | --- |\n| 1 | **bo**
```

```diff
- | a \| b | c |
+ | a \| b | c |\n| --- | --- |
```

```diff opts="tables: false"
- | a | b |
+ | a | b |
```

```diff
- ```\n| a | b |\n```
+ ```\n| a | b |\n```
```

```diff
- a | b
+ a | b
```

---

## Leave list markers alone

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
+ - **text\nmore text**
```

```diff
- * **content\n* Another item
+ * **content\n* Another item
```

---

## Leave code fences alone

```diff
- ```\ncode\n```\n*italic
+ ```\ncode\n```\n*italic*
```

```diff
-     *asterisks in indented
+     *asterisks in indented
```

```diff
-     **bold in indented
+     **bold in indented
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

```diff
- see ```inline code``
+ see ```inline code```
```

```diff
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

A closing fence carries no info string, so a fence line with one is still code content
(nested fences inside a ```` ```md ```` block keep their language tags):

```diff
- ```md\n```js\n**bold
+ ```md\n```js\n**bold
```

```diff
- ```md\n```js\n**bold\n```\nafter **bold
+ ```md\n```js\n**bold\n```\nafter **bold**
```

A shorter or different marker is not a closer either:

```diff
- ````\ncode\n```js\n**bold
+ ````\ncode\n```js\n**bold
```

```diff
- ```\ncode\n~~~\n**bold
+ ```\ncode\n~~~\n**bold
```

---

## Leave horizontal rules alone

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

```diff
- foo*bar
+ foo*bar
```

```diff
- test*123*test
+ test*123*test
```

```diff
- *foo*bar*baz
+ *foo*bar*baz*
```

```diff
- *file*name*ext
+ *file*name*ext*
```

```diff
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

## Nesting inside blockquotes, links and math

```diff
- Text with [link and **bold
+ Text with [link and **bold](auto-close:incomplete-link)
```

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

```diff opts="inlineMath: false, math: false"
- **bold with $x^2
+ **bold with $x^2**
```

```diff opts="inlineMath: true, math: true"
- **bold with $x^2
+ **bold with $x^2$**
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

```diff
- 
+ 
```

```diff
- **bold\twith\ttabs
+ **bold\twith\ttabs**
```

```diff
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
+ Check out [this lin](auto-close:incomplete-link)
```

```diff
- [Click here](https://
+ [Click here](auto-close:incomplete-link)
```

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
+ This is **bold with *ital***
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
+ Text **bold `code`**
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

Drop a trailing opener (`*`, `_`, `~`, `~~`, `` ` ``, `$`, `:`, `[`, `![`, `!`, `{`) after whitespace at EOF so a half-typed marker does not flash. `!` may become `![image`, `:` may become a `:component` directive, `~` may become `~~strike`; the next chunk disambiguates, so the frame hides them until then. Attached markers (`**bold`, `$x`) still auto-close. Only applies to in-flight frames; the final render (`streaming: false`) keeps the character. Enabled automatically when parsing with `streaming: true`.

```diff
- hello *
+ hello
```

```diff
- hello **
+ hello
```

```diff
- hello ***
+ hello
```

```diff
- hello _
+ hello
```

```diff
- hello __
+ hello
```

```diff
- hello $
+ hello
```

```diff
- hello $$
+ hello
```

```diff
- hello ~~
+ hello
```

```diff
- hello `
+ hello
```

```diff
- hello ``
+ hello
```

```diff
- hello [
+ hello
```

```diff
- hello [[
+ hello
```

```diff
- hello {
+ hello
```

```diff
- hello ![
+ hello
```

```diff
- hello :
+ hello
```

```diff
- hello !
+ hello
```

```diff
- hello ~
+ hello
```

Ordinary punctuation that can never start syntax stays:

```diff
- hello ,
+ hello ,
```

```diff
- hello .
+ hello .
```

```diff
- hello ?
+ hello ?
```

An earlier space-separated `*` cannot become syntax (it is already followed by space), so only the last opener is dropped:

```diff
- hello * *
+ hello *
```

Attached incomplete syntax is still closed:

```diff
- hello **bold
+ hello **bold**
```

The drop is independent of the per-construct flags. Those decide whether a *closer is
inserted*, not whether a half-typed marker is hidden, so a disabled construct still drops its
opener:

```diff opts="inlineCode: false"
- value `
+ value
```

```diff opts="bold: false, italic: false, boldItalic: false"
- hello *
+ hello
```

```diff opts="links: false"
- hello [
+ hello
```

---

## Markers stay when the drop flag is off

Every case above, mirrored at the default `dropTrailingOpeners: false`. Nothing is dropped:
a marker that would be hidden in an in-flight frame is plain text in the final render, even
when its construct is disabled.

```diff
- hello *
+ hello *
```

```diff
- hello **
+ hello **
```

```diff
- hello ***
+ hello ***
```

```diff
- hello _
+ hello _
```

```diff
- hello __
+ hello __
```

```diff
- hello $
+ hello $
```

```diff
- hello $$
+ hello $$
```

```diff
- hello ~~
+ hello ~~
```

```diff
- hello `
+ hello `
```

```diff
- hello ``
+ hello ``
```

```diff
- hello [
+ hello [
```

```diff
- hello [[
+ hello [[
```

```diff
- hello {
+ hello {
```

```diff
- hello ![
+ hello ![
```

```diff
- hello :
+ hello :
```

```diff
- hello !
+ hello !
```

```diff
- hello ~
+ hello ~
```

```diff
- hello ,
+ hello ,
```

```diff
- hello .
+ hello .
```

```diff
- hello ?
+ hello ?
```

```diff
- hello * *
+ hello * *
```

```diff opts="inlineCode: false"
- value `
+ value `
```

```diff opts="bold: false, italic: false, boldItalic: false"
- hello *
+ hello *
```

```diff opts="links: false"
- hello [
+ hello [
```

The backtick cases from *Extra streaming tests* likewise keep every character. What still
changes is ordinary healing — closing an open construct, padding a short closer, trimming one
trailing space — none of which is a drop:

```diff
- close ``
+ close ``
```

```diff
- space `` ``
+ space `` ``
```

```diff
- space `` `` code
+ space `` `` code
```

```diff
- x `a` `
+ x `a` `
```

```diff
- escape lone `~` (`
+ escape lone `~` (`
```

```diff
- text*
+ text*
```

```diff
- word_
+ word_
```

```diff
- text123$
+ text123$
```

```diff
- hello **bold
+ hello **bold**
```

```diff
- space `` `
+ space `` ``
```

```diff
- spaces ``  `
+ spaces ``  ``
```

```diff
- space `` x `
+ space `` x ``
```

```diff
- a `` ` `
+ a `` ` ``
```

```diff
- space ``` `
+ space ``` ```
```

```diff
- **bold.*
+ **bold.**
```

```diff
- ~~strike.~
+ ~~strike.~~
```

---

## Package extras

```diff
- text~
+ text~
```

```diff opts="links: false, images: false"
- [link text
+ [link text
```

---

## Math shields `<` from HTML tag stripping

Math is opaque to `htmlTags`: nothing inside a math span is inspected, whether the span is complete or still open at EOF. Whether a span *is* math is decided solely by the flags — `blockMath` for `$$…$$`, `inlineMath` for `$…$`, both off by default. With the flag off the delimiters are plain text and an incomplete tag after them is dropped as usual.

With the flags off, dollars are text and tags are dropped. Both are pinned per case here
because the runner baseline enables `blockMath` (see Options):

```diff opts="blockMath: false, inlineMath: false"
- inline $A_{j<k}$ more
+ inline $A_{j
```

```diff opts="blockMath: false, inlineMath: false"
- $a <div
+ $a
```

```diff opts="blockMath: false, inlineMath: false"
- $$a<b c$$ done
+ $$a
```

```diff opts="blockMath: false, inlineMath: false"
- $$ x <div
+ $$ x
```

```diff opts="blockMath: false, inlineMath: false"
- $x<y$ then <div
+ $x
```

Block math on: shields, complete or open:

```diff opts="blockMath: true"
- Intro\n\n$$\nI = \sum_{j<k} p_j\n$$\n\nTAIL
+ Intro\n\n$$\nI = \sum_{j<k} p_j\n$$\n\nTAIL
```

```diff opts="blockMath: true"
- $$ a<b> c $$
+ $$ a<b> c $$
```

```diff opts="math: true"
- $$ x <div
+ $$ x <div$$
```

```diff opts="blockMath: true"
- $$\na<b <span
+ $$\na<b <span\n$$
```

```diff opts="blockMath: true"
- $$a<b$$ done <span
+ $$a<b$$ done
```

Inline math on: shields, complete or open:

```diff opts="inlineMath: true"
- inline $A_{j<k}$ more
+ inline $A_{j<k}$ more
```

```diff opts="inlineMath: true"
- $a <div
+ $a <div$
```

```diff opts="math: true"
- $x<y$ then <div
+ $x<y$ then
```

## htmlTags false


```diff opts="htmlTags: false, blockMath: false, inlineMath: false"
- inline $A_{j<k}$ more
+ inline $A_{j<k}$ more
```

```diff opts="htmlTags: false, blockMath: false, inlineMath: false"
- $a <div
+ $a <div
```

```diff opts="htmlTags: false, blockMath: false, inlineMath: false"
- $$a<b c$$ done
+ $$a<b c$$ done
```

```diff opts="htmlTags: false, blockMath: false, inlineMath: false"
- $$ x <div
+ $$ x <div
```

```diff opts="htmlTags: false, blockMath: false, inlineMath: false"
- $x<y$ then <div
+ $x<y$ then <div
```

## List

Drop empty list items at the end of the list

```diff
- - item one\n- 
+ - item one
```

```diff
- - item one\n-
+ - item one
```

```diff
- - item one\n- s
+ - item one\n- s
```

Any marker, including ordered and nested items, and every trailing empty item:

```diff
- 1. item one\n2. 
+ 1. item one
```

```diff
- - a\n  - 
+ - a
```

```diff
- - a\n- \n- 
+ - a
```

The item before it is still healed:

```diff
- - item **bold\n- 
+ - item **bold**
```

Only a bare marker is empty — a task-list checkbox is content, and a rule is not a list item:

```diff
- - [x] done\n- [ ] 
+ - [x] done\n- [ ]
```

```diff
- - a\n---
+ - a\n---
```

The marker must directly follow a list item. Under a paragraph the same line is a setext
candidate and gets the U+200B guard instead (see *Setext heading guard*), and a blank line
ends the run:

```diff
- - a\n\n- 
+ - a\n\n-
```

## Extra streaming tests

```diff opts="dropTrailingOpeners: true"
- close `` 
+ close
```

```diff opts="dropTrailingOpeners: true"
- close ``
+ close
```

Ignore inline code if it cointains only one character and its space

```diff opts="dropTrailingOpeners: true"
- space `` `
+ space
```

We don't do anything if it is closed

```diff opts="dropTrailingOpeners: true"
- space `` ``
+ space `` ``
```

```diff opts="dropTrailingOpeners: true"
- space `` `` code
+ space `` `` code
```

```diff opts="dropTrailingOpeners: true"
- spaces ``  `
+ spaces ``  ``
```

Once the span holds content the closer is completed, whatever the opener's length:

```diff opts="dropTrailingOpeners: true"
- space `` x `
+ space `` x ``
```

```diff opts="dropTrailingOpeners: true"
- a `` ` `
+ a `` ` ``
```

```diff opts="dropTrailingOpeners: true"
- space ``` `
+ space
```

With no span open the trailing backtick is just a half-typed opener again:

```diff opts="dropTrailingOpeners: true"
- x `a` `
+ x `a`
```

```diff opts="dropTrailingOpeners: true"
- escape lone `~` (`
+ escape lone `~` (
```

Punctuation before the marker is no protection — only a word is, because there the marker is
prose or a closer:

```diff opts="dropTrailingOpeners: true"
- text*
+ text*
```

```diff opts="dropTrailingOpeners: true"
- word_
+ word_
```

Dropping a partial closer is safe: the heal still emits the full one.

```diff opts="dropTrailingOpeners: true"
- **bold.*
+ **bold.**
```

```diff opts="dropTrailingOpeners: true"
- ~~strike.~
+ ~~strike.~~
```
