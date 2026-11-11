# Advanced Encoding Bypass Attempts

## Autolink with percent-encoded markdown syntax
<https://example.com/%21%5Btest%5D%28javascript%3Aalert%28%27encoded%27%29%29>

## Autolink with double percent-encoded attack
<https://example.com/%252521%25255Btest%25255D%252528javascript%25253Aalert%252528%252527double%252527%252529%252529>

## Autolink with HTML entity-encoded attack
<https://example.com/&#33;&#91;test&#93;&#40;javascript&#58;alert&#40;&#39;entity&#39;&#41;&#41;>

## Autolink with mixed encoding types
<https://example.com/%21&#91;test&#93;%28javascript%3A&#97;&#108;&#101;&#114;&#116;&#40;&#39;mixed&#39;&#41;&#41;>

## Autolink with unicode fullwidth characters
<https://example.com/！［test］（javascript：alert（'fullwidth'））>

## Autolink with unicode mathematical characters
<https://example.com/𝟘［test］（javascript：alert（'math'））>

## Autolink with unicode homoglyphs
<https://example.com/![test](javascrіpt:alert('homoglyph'))>

## Autolink with combining characters
<https://example.com/![test](javascript⃥:alert('combining'))>

## Autolink with zero-width characters
<https://example.com/![test](java​script:alert('zwsp'))>

## Autolink with right-to-left override
<https://example.com/![test](‮tpircsavaj:alert('rtl'))>

## Autolink with left-to-right embedding
<https://example.com/![test](‪javascript:alert('ltr')‬)>

## Autolink with bidirectional text
<https://example.com/![test](java‏script:alert('bidi'))>

## Autolink with surrogate pairs
<https://example.com/![test](𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:alert('surrogate'))>

## Autolink with normalization form variations
<https://example.com/![test](javascript:alert('nfc'))>
<https://example.com/![test](javascript:alert('nfd'))>

## Autolink with IDNA encoding
<https://еxamplе.com/![test](javascript:alert('idna'))>

## Autolink with Punycode in attack
<https://example.com/![test](javascript:alert('xn--punycode'))>

## Autolink with base64 encoded attack
<https://example.com/![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgneGJ4c2V4CkAnKTwvc2NyaXB0Pg==)>

## Autolink with URL-safe base64
<https://example.com/![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgnYmFzZTY0Jyk8L3NjcmlwdD4_)>

## Autolink with ROT13 encoding
<https://example.com/![test](wninfpevcg:nyreg('rot13'))>

## Autolink with Caesar cipher
<https://example.com/![test](mdydvfulws:dohuw('caesar'))>

## Autolink with hex encoding
<https://example.com/![test](0x6A617661736372697074:alert('hex'))>

## Autolink with octal encoding
<https://example.com/![test](\152\141\166\141\163\143\162\151\160\164:alert('octal'))>

## Autolink with Unicode escape sequences
<https://example.com/![test](\u006A\u0061\u0076\u0061\u0073\u0063\u0072\u0069\u0070\u0074:alert('unicode'))>

## Autolink with JSON Unicode escapes
<https://example.com/![test](javascript\u003Aalert\u0028\u0027json\u0027\u0029)>

## Autolink with XML character references
<https://example.com/![test](&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert('xml'))>

## Autolink with mixed case hex encoding
<https://example.com/![test](%6A%61%76%61%73%63%72%69%70%74%3a%61%6c%65%72%74%28%27%6d%69%78%65%64%27%29)>

## Autolink with overlong UTF-8 encoding  
<https://example.com/![test](javascript:alert('overlong'))>

## Autolink with UTF-7 encoding
<https://example.com/![test](+AGoAYQB2AGEAcwBjAHIAaQBwAHQA:alert('utf7'))>