# URL Encoding Bypass Attempts

## Autolink with percent-encoded markdown syntax
<https://example.com/%21%5Btest%5D%28javascript%3Aalert%28%27url-encoded%27%29%29>

## Autolink with double percent-encoded attack
<https://example.com/%252521%25255Btest%25255D%252528javascript%25253Aalert%252528%252527double%252527%252529%252529>

## Autolink with triple percent-encoded attack
<https://example.com/%25252521%2525255Btest%2525255D%25252528javascript%2525253Aalert%25252528%25252527triple%25252527%25252529%25252529>

## Autolink with mixed case percent encoding
<https://example.com/%2521%5btest%5d%28javascript%3aalert%28%27mixed%27%29%29>

## Autolink with overlong percent encoding
<https://example.com/%C0%A1%5Btest%5D%28javascript%3Aalert%28%27overlong%27%29%29>

## Autolink with UTF-8 percent encoding
<https://example.com/%E2%80%BC%5Btest%5D%28javascript%3Aalert%28%27utf8%27%29%29>

## Autolink with plus encoding for spaces
<https://example.com/![test](javascript:alert('plus+space'))>

## Autolink with NULL byte percent encoding
<https://example.com/%00![test](javascript:alert('null'))>

## Autolink with control character encoding
<https://example.com/%01%02%03![test](javascript:alert('control'))>

## Autolink with form feed encoding
<https://example.com/%0C![test](javascript:alert('formfeed'))>

## Autolink with vertical tab encoding
<https://example.com/%0B![test](javascript:alert('vtab'))>

## Autolink with backspace encoding
<https://example.com/%08![test](javascript:alert('backspace'))>

## Autolink with DEL character encoding
<https://example.com/%7F![test](javascript:alert('del'))>

## Autolink with high bit set encoding
<https://example.com/%80![test](javascript:alert('highbit'))>

## Autolink with non-ASCII percent encoding
<https://example.com/%C2%A0![test](javascript:alert('nbsp'))>

## Autolink with incomplete percent encoding
<https://example.com/%2![test](javascript:alert('incomplete'))>

## Autolink with invalid percent encoding
<https://example.com/%GG![test](javascript:alert('invalid'))>

## Autolink with lowercase hex percent encoding
<https://example.com/%2a![test](javascript:alert('lowercase'))>

## Autolink with uppercase hex percent encoding
<https://example.com/%2A![test](javascript:alert('uppercase'))>

## Autolink with percent-encoded percent signs
<https://example.com/%2521%255Btest%255D%2528javascript%253Aalert%2528%2527nested%2527%2529%2529>