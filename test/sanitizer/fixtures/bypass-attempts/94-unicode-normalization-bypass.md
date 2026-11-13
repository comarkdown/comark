# Unicode Normalization Bypass Attempts

## Autolink with fullwidth characters
<https://example.com/！［test］（javascript：alert（'fullwidth'））>

## Autolink with mathematical alphanumeric symbols
<https://example.com/𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:𝒶𝓁ℯ𝓇𝓉('math-symbols')>

## Autolink with bold mathematical characters
<https://example.com/𝐣𝐚𝐯𝐚𝐬𝐜𝐫𝐢𝐩𝐭:𝐚𝐥𝐞𝐫𝐭('bold-math')>

## Autolink with italic mathematical characters
<https://example.com/𝑗𝑎𝑣𝑎𝑠𝑐𝑟𝑖𝑝𝑡:𝑎𝑙𝑒𝑟𝑡('italic-math')>

## Autolink with script mathematical characters
<https://example.com/𝒥𝒶𝓋𝒶𝒮𝒸𝓇𝒾𝓅𝓉:𝒶𝓁ℯ𝓇𝓉('script-math')>

## Autolink with Cyrillic homoglyphs
<https://example.com/![test](јаvascript:alert('cyrillic'))>

## Autolink with Greek homoglyphs
<https://example.com/![test](ϳаvascript:alert('greek'))>

## Autolink with Armenian homoglyphs
<https://example.com/![test](javascript։alert('armenian'))>

## Autolink with zero-width joiner
<https://example.com/![test](java‍script:alert('zwj'))>

## Autolink with zero-width non-joiner
<https://example.com/![test](java‌script:alert('zwnj'))>

## Autolink with zero-width space
<https://example.com/![test](java​script:alert('zwsp'))>

## Autolink with word joiner
<https://example.com/![test](java⁠script:alert('wj'))>

## Autolink with invisible separator
<https://example.com/![test](java⁣script:alert('invisible-sep'))>

## Autolink with combining characters
<https://example.com/![test](java⃝script:alert('combining'))>

## Autolink with diacritical marks
<https://example.com/![test](jávâscript:alert('diacritics'))>

## Autolink with ligatures
<https://example.com/![test](ﬁlescript:alert('ligature'))>

## Autolink with ideographic space
<https://example.com/![test](java　script:alert('ideographic-space'))>

## Autolink with em space
<https://example.com/![test](java script:alert('em-space'))>

## Autolink with en space
<https://example.com/![test](java script:alert('en-space'))>

## Autolink with thin space
<https://example.com/![test](java script:alert('thin-space'))>

## Autolink with hair space
<https://example.com/![test](java script:alert('hair-space'))>

## Autolink with punctuation space
<https://example.com/![test](java script:alert('punct-space'))>

## Autolink with figure space
<https://example.com/![test](java script:alert('figure-space'))>

## Autolink with narrow no-break space
<https://example.com/![test](java script:alert('narrow-nbsp'))>

## Autolink with medium mathematical space
<https://example.com/![test](java script:alert('med-math-space'))>

## Autolink with right-to-left override
<https://example.com/![test](‮tpircsavaj:alert('rtl-override'))>

## Autolink with left-to-right override
<https://example.com/![test](‭javascript:alert('ltr-override')‬)>

## Autolink with right-to-left embedding
<https://example.com/![test](‫javascript:alert('rtl-embed')‬)>

## Autolink with left-to-right embedding
<https://example.com/![test](‪javascript:alert('ltr-embed')‬)>

## Autolink with pop directional formatting
<https://example.com/![test](javascript‏:‏alert‏('pdf'))>

## Autolink with first strong isolate
<https://example.com/![test](⁦javascript:alert('fsi')⁩)>

## Autolink with left-to-right isolate
<https://example.com/![test](⁦javascript:alert('lri')⁩)>

## Autolink with right-to-left isolate
<https://example.com/![test](⁧javascript:alert('rli')⁩)>

## Autolink with normalization form confusion (NFC vs NFD)
<https://example.com/![test](javascript:alert('nfc-é'))>
<https://example.com/![test](javascript:alert('nfd-é'))>

## Autolink with IDNA confusables
<https://еxаmplе.com/![test](javascript:alert('idna-confusable'))>

## Autolink with mixed scripts
<https://example.com/![test](јаvascгіpt:alert('mixed-script'))>

## Autolink with variation selectors
<https://example.com/![test](javascript︀:alert('variation-selector'))>

## Autolink with format characters
<https://example.com/![test](java﻿script:alert('format-char'))>

## Autolink with tag characters
<https://example.com/![test](javascript󠀀:alert('tag-char'))>

## Autolink with private use area characters
<https://example.com/![test](javascript:alert('private-use'))>

## Autolink with surrogate pairs in URL
<https://example.com/![test](𝕛𝕒𝕧𝕒𝕤𝕔𝕣𝕚𝕡𝕥:alert('surrogate'))>

## Autolink with composed vs decomposed forms
<https://example.com/![test](javascript:alert('composéd'))>
<https://example.com/![test](javascript:alert('decomposed'))>