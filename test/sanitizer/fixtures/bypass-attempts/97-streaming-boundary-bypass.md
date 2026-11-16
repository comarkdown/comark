# Streaming Boundary Bypass Attempts

## Autolink split across streaming chunks (part 1 + part 2)
<https://example.com/![test](javascript:alert('stream-split'))>

## Autolink with chunk boundary in protocol
<https://example.com/![test](javascript:alert('protocol-boundary'))>

## Autolink with chunk boundary in domain
<https://example.com/![test](javascript:alert('domain-boundary'))>

## Autolink with chunk boundary in path
<https://example.com/![test](javascript:alert('path-boundary'))>

## Autolink with chunk boundary in query
<https://example.com/path?param=![test](javascript:alert('query-boundary'))>

## Autolink with chunk boundary in fragment
<https://example.com/path#![test](javascript:alert('fragment-boundary'))>

## Autolink with chunk boundary in markdown syntax
<https://example.com/![test](javascript:alert('markdown-boundary'))>

## Autolink with chunk boundary in attack payload
<https://example.com/![test](javascript:alert('payload-boundary'))>

## Multiple autolinks with boundaries between them
<https://one.com/![a](javascript:alert('multi-a'))>
<https://two.com/![b](javascript:alert('multi-b'))>

## Autolink with newline creating natural chunk boundary
<https://example.com/
![test](javascript:alert('newline-boundary'))>

## Autolink with very long URL creating buffer issues
<https://example.com/very/long/path/that/might/cause/buffer/issues/in/streaming/parsers/![test](javascript:alert('long-url'))>

## Autolink at exact buffer size boundaries (1024 chars)
<https://example.com/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/padding/![test](javascript:alert('buffer-size'))>

## Autolink with incomplete markdown syntax at chunk end
<https://example.com/![test](javascript:alert('incomplete-chunk'))

## Autolink with bracket mismatch across chunks
<https://example.com/![test](javascript:alert('bracket-mismatch'))]

## Autolink with escape sequence across chunks
<https://example.com/![test\](javascript:alert('escape-chunk'))>

## Autolink with Unicode character split across chunk boundary
<https://example.com/![test](javascript:alert('unicode-split-🎯'))>

## Autolink with UTF-8 multi-byte sequence split
<https://example.com/![test](javascript:alert('utf8-split-é'))>

## Autolink ending exactly at chunk boundary
<https://example.com/![test](javascript:alert('exact-end'))>

## Autolink starting exactly at chunk boundary
<https://example.com/![test](javascript:alert('exact-start'))>

## Autolink with parser state reset between chunks
<https://example.com/![test](javascript:alert('state-reset'))>

## Autolink with incomplete autolink syntax
<https://example.com/![test](javascript:alert('incomplete-autolink')

## Autolink with trailing characters after chunk
<https://example.com/![test](javascript:alert('trailing'))> extra

## Autolink with leading characters before chunk
prefix <https://example.com/![test](javascript:alert('leading'))>

## Multiple incomplete autolinks creating confusion
<https://example.com/![a](javascript:alert('incomplete-a')
<https://example.com/![b](javascript:alert('incomplete-b'))>

## Autolink with markdown reference split across chunks
<https://example.com/![ref][dangerous]>

[dangerous]: javascript:alert('ref-split')

## Autolink with HTML entity split across chunks
<https://example.com/![test](javascript&
#58;alert('entity-split'))>

## Autolink with percent encoding split across chunks
<https://example.com/![test](javascript%
3Aalert('percent-split'))>

## Autolink with base64 data split across chunks
<https://example.com/![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgnc3BsaXQnKTs8L3NjcmlwdD4=)>

## Autolink causing buffer overflow in parser
<https://example.com/![test](javascript:alert('overflow'))}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]}]>

## Autolink with streaming parser confusion
<https://example.com/![test](javascript:alert('parser-confusion'))>
Some text that might reset parser state
<https://example.com/![test2](javascript:alert('second-attack'))>

## Autolink with chunk size manipulation
<https://example.com/![test](javascript:alert('chunk-size'))>

## Autolink with parser lookahead issues
<https://example.com/![test](javascript:alert('lookahead'))> followed by more content

## Autolink with streaming context loss
Context before
<https://example.com/![test](javascript:alert('context-loss'))>
Context after

## Autolink with flush boundary exploitation
<https://example.com/![test](javascript:alert('flush-boundary'))>

## Autolink with end-of-stream boundary
<https://example.com/![test](javascript:alert('eos-boundary'))>