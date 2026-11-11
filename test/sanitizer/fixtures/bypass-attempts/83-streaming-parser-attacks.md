# Streaming Parser Attacks

## Image split across streaming chunks
![test](java
script:alert('streaming'))

## Reference definition split across chunks
![test][stream-ref]

[stream-ref]: java
script:alert('stream-ref')

## URL that breaks at protocol boundary
![test](https://
evil.com/javascript:alert('protocol-split'))

## Image syntax broken across newlines mid-parse
![test](https://example.com/
javascript:alert('newline-split'))

## Incomplete image that completes in next chunk
![incomplete

End of first chunk, start of second:
](javascript:alert('completion'))

## Reference that spans streaming boundary
![test][partial

The reference definition in next chunk:
[partial]: javascript:alert('span')

## Image with very long URL split across chunks
![test](https://example.com/very/long/path/that/might/be/split/across/streaming/chunks/and/contains/java
script:alert('long-split'))

## Malformed image syntax across chunks
![test
](javascript:alert('malformed-split'))

## Image inside fenced code block split
```
![test](java
script:alert('code-split'))
```

## Multiple images where second completes malicious URL
![safe](https://example.com/safe.jpg) ![malicious](java
script:alert('multi-split'))

## Image reference with definition spanning chunks
![streaming-attack][ref]

[ref]: java
script:alert('ref-span')

## Protocol injection across streaming boundary
![test](java	
script:alert('tab-boundary'))

## Image with title spanning chunks
![test](https://example.com/safe.jpg "title with java
script:alert('title-span')")

## Incomplete bracket syntax across chunks
![test](javascript:alert('bracket')
More content that might affect parsing

## Image URL with encoding across boundary
![test](https://example.com/%6A%61%76%61%73%63%72%69%70%74%3A
alert('encoding-span'))

## Reference-style image with late definition
![delayed][delayed-ref]

Some content in between chunks...

[delayed-ref]: javascript:alert('delayed')

## Image breaking out of emphasis across chunks
*Emphasized text with ![test](java
script:alert('emphasis-span'))* continued

## Multiple incomplete images
![first](java
![second](script:alert('multiple'))

## Image with complex nesting across boundaries
[![nested](java
script:alert('nested-span'))](https://example.com)