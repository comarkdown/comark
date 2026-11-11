# URL Constructor Edge Cases

## Leading/trailing whitespace bypass attempts  
![](   javascript:alert('leading-spaces'))
![](javascript:alert('trailing-spaces')   )
![]( 	javascript:alert('mixed-whitespace')	 )

## URL constructor protocol confusion
![](JAVASCRIPT:alert('upper-protocol'))
![](JavaScript:alert('camel-protocol'))
![](JaVaScRiPt:alert('random-case'))

## URL constructor with unusual but valid schemes
![](vbscript:MsgBox('vbs'))
![](jscript:alert('jscript'))
![](ecmascript:alert('ecma'))
![](livescript:alert('live'))

## URL constructor edge cases with ports  
![](javascript://fake-host:8080/alert('port-confuse'))
![](http://evil.com:javascript:alert@good.com)

## URL constructor with IPv6 addresses
![](javascript://[::1]:8080/alert('ipv6'))
![](http://[2001:db8::1]:javascript:alert/path)

## URL constructor normalization bypasses
![](javascript:///alert('triple-slash'))
![](javascript:////alert('quad-slash'))
![](javascript:\alert('backslash'))
![](javascript://./alert('dot-slash'))
![](javascript://../alert('dotdot-slash'))

## Edge cases in authority parsing
![](javascript://user@host:alert('user-confuse'))
![](javascript://@:alert('empty-user'))
![](javascript://:@alert('empty-pass'))