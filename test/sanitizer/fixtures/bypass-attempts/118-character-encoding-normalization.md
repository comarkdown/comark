# Character Encoding and Normalization Attacks

## Test 1: UTF-8 BOM injection
﻿![test](javascript:alert('bom'))

## Test 2: Unicode normalization form confusion
![test](javascript:alert('NFC'))
![test](javascrıpt:alert('Turkish-i'))

## Test 3: Unicode combining character attacks  
![test](javascript:ale‌rt('zwj'))
![test](javascript:aler⁡t('invisible'))

## Test 4: Mixed writing direction attacks
![test](javascript:alert‮)('rtl'‭))

## Test 5: Unicode control character injection
![test](javascript:alert('control'))

## Test 6: Surrogate pair manipulation
![test](𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:alert('math'))

## Test 7: Unicode homograph domain spoofing
![test](https://еxample.com/javascript:alert('cyrillic'))
![test](https://examplе.com/javascript:alert('cyrillic-e'))

## Test 8: Mixed alphabet character substitution
![test](ⅉavascript:alert('roman-numerals'))

## Test 9: Unicode block confusion
![test](𝖏𝖆𝖛𝖆𝖘𝖈𝖗𝖎𝖕𝖙:alert('fraktur'))

## Test 10: Zero-width space insertion
![test](java​script:alert('zwsp'))

## Test 11: Unicode line separator confusion
![test](javascript:alert('line-sep'))

## Test 12: Unicode paragraph separator
![test](javascript:alert('para-sep'))

## Test 13: Fullwidth character bypass
![test](ｊａｖａｓｃｒｉｐｔ：alert（'fullwidth'）)

## Test 14: Unicode category confusion (Letter vs Symbol)
![test](𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:alert('category'))

## Test 15: Normalization form decomposition
![test](javascript:ale＠rt('decomp'))

## Test 16: Case folding bypass
![test](JAVASCRIPT:ALERT('UPPER'))

## Test 17: Unicode combining marks in protocol
![test](ja̧vascript:alert('combining'))

## Test 18: Unicode confusable characters
![test](јаvascript:alert('confusable'))

## Test 19: Unicode variation selectors
![test](javascript︀:alert('variation'))

## Test 20: Mixed encoding within same string
![test](javas%43ript:alert('mixed-encoding'))

## Test 21: Unicode escape sequence normalization
![test](j\u0061v\u0061script:alert('unicode-escape'))

## Test 22: HTML entity vs Unicode normalization
![test](j&#97;vascript:alert('entity-vs-unicode'))

## Test 23: Locale-specific character handling
![test](İstanbul) <!-- Turkish capital I with dot -->
![test](istanbul) <!-- lowercase -->

## Test 24: Unicode age and version confusion
![test](𝕛𝕒𝕧𝕒𝕤𝕔𝕣𝕚𝕡𝕥:alert('double-struck'))

## Test 25: Unicode private use area
![test](:alert('private-use'))

## Test 26: Byte order mark at various positions
![test](java﻿script:alert('bom-middle'))

## Test 27: Unicode canonical equivalence
![test](javascript:alert('canonical'))
![test](javascrïpt:alert('non-canonical'))

## Test 28: Grapheme cluster boundary confusion
![test](ja👨‍💻vascript:alert('grapheme'))

## Test 29: Unicode bidirectional override sequences
![test](‮tpircsavaj:alert('bidi')‬)

## Test 30: Ideographic space and punctuation
![test](javascript　alert（'ideographic'））