# Percent Encoding Edge Cases

## Invalid percent encoding sequences
![](https://example.com/%6A%6av%61script:alert('incomplete'))
![](https://example.com/%6A%za%76%61script:alert('invalid-hex'))

## Mixed case percent encoding
![](https://example.com/%6a%41%76%41script:alert('mixed-case'))
![](https://example.com/%6A%61%76%61Script:alert('protocol-case'))

## Overlong percent encoding sequences 
![](https://example.com/%256A%2561%2576%2561script:alert('double-encoded'))
![](https://example.com/%25256A%25256A%252576%252561script:alert('triple-encoded'))

## Null byte percent encoding variations
![](https://example.com/java%00script:alert('null1'))
![](https://example.com/java%0000script:alert('null2'))
![](https://example.com/java%000script:alert('null3'))

## Control character percent encoding in protocol
![](https://example.com/%01javascript:alert('ctrl1'))
![](https://example.com/java%09script:alert('tab-encoded'))
![](https://example.com/java%0Ascript:alert('lf-encoded'))
![](https://example.com/java%0Dscript:alert('cr-encoded'))

## Percent encoding of colon variations
![](https://example.com/javascript%3Aalert('colon1'))
![](https://example.com/javascript%3aalert('colon2'))
![](https://example.com/javascript%253Aalert('double-colon'))