# Image Reference Manipulation

## Reference definition with protocol injection
![test][ref1]

[ref1]: javascript:alert('ref')

## Reference with tab separation
![test][ref2]

[ref2]:	javascript:alert('tab-ref')

## Reference with newline separation
![test][ref3]

[ref3]:
    javascript:alert('newline-ref')

## Reference with excessive whitespace
![test][ref4]

[ref4]:     javascript:alert('space-ref')

## Reference redefinition attack
![test][ref5]

[ref5]: https://safe.com/image.jpg
[ref5]: javascript:alert('redef')

## Case-insensitive reference attack
![test][REF6]

[ref6]: javascript:alert('case')

## Reference with title injection
![test][ref7]

[ref7]: https://safe.com/img.jpg "javascript:alert('title')"

## Partial reference completion
![test][re

[ref8]: javascript:alert('partial')

## Reference with encoded characters
![test][ref9]

[ref9]: java%73cript:alert('encoded-ref')

## Reference loop confusion
![test][loop1]
![test][loop2]

[loop1]: javascript:alert('loop1')
[loop2]: [loop1]