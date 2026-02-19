## Input

```md
# CJK Language Support

Comark properly handles emphasis in Chinese, Japanese, and Korean text, even with ideographic punctuation.

## Japanese

Standard markdown breaks with ideographic punctuation:

**この文は太字になります（This sentence will be bolded）。**この文が後に続いても大丈夫です。

*斜体のテキスト【補足情報】。*この文が後に続いても大丈夫です。

~~削除されたテキスト（古い情報）。~~この文は正しいです。

## Chinese

Works seamlessly with Chinese punctuation:

**重要提示（Important Notice）：**请注意。

*这是斜体文字（带括号）。*这句子继续也没问题。

~~旧方法（已废弃）。~~这个句子是正确的。

## Korean

Korean text with mixed punctuation:

**한국어 구문(괄호 포함)**을 강조.

*이 텍스트(괄호 포함)*는 기울임꼴입니다.

~~이 텍스트(괄호 포함)~~를 삭제합니다.
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "h1",
      {
        "id": "cjk-language-support"
      },
      "CJK Language Support"
    ],
    [
      "p",
      {},
      "Comark properly handles emphasis in Chinese, Japanese, and Korean text, even with ideographic punctuation."
    ],
    [
      "h2",
      {
        "id": "japanese"
      },
      "Japanese"
    ],
    [
      "p",
      {},
      "Standard markdown breaks with ideographic punctuation:"
    ],
    [
      "p",
      {},
      [
        "strong",
        {},
        "この文は太字になります（This sentence will be bolded）。"
      ],
      "この文が後に続いても大丈夫です。"
    ],
    [
      "p",
      {},
      [
        "em",
        {},
        "斜体のテキスト【補足情報】。"
      ],
      "この文が後に続いても大丈夫です。"
    ],
    [
      "p",
      {},
      [
        "del",
        {},
        "削除されたテキスト（古い情報）。"
      ],
      "この文は正しいです。"
    ],
    [
      "h2",
      {
        "id": "chinese"
      },
      "Chinese"
    ],
    [
      "p",
      {},
      "Works seamlessly with Chinese punctuation:"
    ],
    [
      "p",
      {},
      [
        "strong",
        {},
        "重要提示（Important Notice）："
      ],
      "请注意。"
    ],
    [
      "p",
      {},
      [
        "em",
        {},
        "这是斜体文字（带括号）。"
      ],
      "这句子继续也没问题。"
    ],
    [
      "p",
      {},
      [
        "del",
        {},
        "旧方法（已废弃）。"
      ],
      "这个句子是正确的。"
    ],
    [
      "h2",
      {
        "id": "korean"
      },
      "Korean"
    ],
    [
      "p",
      {},
      "Korean text with mixed punctuation:"
    ],
    [
      "p",
      {},
      [
        "strong",
        {},
        "한국어 구문(괄호 포함)"
      ],
      "을 강조."
    ],
    [
      "p",
      {},
      [
        "em",
        {},
        "이 텍스트(괄호 포함)"
      ],
      "는 기울임꼴입니다."
    ],
    [
      "p",
      {},
      [
        "del",
        {},
        "이 텍스트(괄호 포함)"
      ],
      "를 삭제합니다."
    ]
  ]
}
```

## HTML

```html
<h1 id="cjk-language-support">CJK Language Support</h1>
<p>Comark properly handles emphasis in Chinese, Japanese, and Korean text, even with ideographic punctuation.</p>
<h2 id="japanese">Japanese</h2>
<p>Standard markdown breaks with ideographic punctuation:</p>
<p><strong>この文は太字になります（This sentence will be bolded）。</strong>この文が後に続いても大丈夫です。</p>
<p><em>斜体のテキスト【補足情報】。</em>この文が後に続いても大丈夫です。</p>
<p>
  <del>
    削除されたテキスト（古い情報）。
  </del>この文は正しいです。
</p>
<h2 id="chinese">Chinese</h2>
<p>Works seamlessly with Chinese punctuation:</p>
<p><strong>重要提示（Important Notice）：</strong>请注意。</p>
<p><em>这是斜体文字（带括号）。</em>这句子继续也没问题。</p>
<p>
  <del>
    旧方法（已废弃）。
  </del>这个句子是正确的。
</p>
<h2 id="korean">Korean</h2>
<p>Korean text with mixed punctuation:</p>
<p><strong>한국어 구문(괄호 포함)</strong>을 강조.</p>
<p><em>이 텍스트(괄호 포함)</em>는 기울임꼴입니다.</p>
<p>
  <del>
    이 텍스트(괄호 포함)
  </del>를 삭제합니다.
</p>
```

## Markdown

```md
# CJK Language Support

Comark properly handles emphasis in Chinese, Japanese, and Korean text, even with ideographic punctuation.

## Japanese

Standard markdown breaks with ideographic punctuation:

**この文は太字になります（This sentence will be bolded）。**この文が後に続いても大丈夫です。

*斜体のテキスト【補足情報】。*この文が後に続いても大丈夫です。

~~削除されたテキスト（古い情報）。~~この文は正しいです。

## Chinese

Works seamlessly with Chinese punctuation:

**重要提示（Important Notice）：**请注意。

*这是斜体文字（带括号）。*这句子继续也没问题。

~~旧方法（已废弃）。~~这个句子是正确的。

## Korean

Korean text with mixed punctuation:

**한국어 구문(괄호 포함)**을 강조.

*이 텍스트(괄호 포함)*는 기울임꼴입니다.

~~이 텍스트(괄호 포함)~~를 삭제합니다.
```
