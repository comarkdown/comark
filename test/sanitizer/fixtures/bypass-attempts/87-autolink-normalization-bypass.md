# Autolink Normalization Bypass Attempts

## Autolink with embedded image after URL normalization
<https://example.com/![test](javascript:alert('after-norm'))>

## Autolink with multiple protocol schemes
<ftp://![test](javascript:alert('ftp'))>
<file://![test](javascript:alert('file'))>

## Autolink with URL that gets normalized to dangerous content
<https://example.com/%6A%61%76%61%73%63%72%69%70%74%3A![test](alert('encoded'))>

## Autolink with fragments containing attacks
<https://example.com/#![test](javascript:alert('fragment'))>

## Autolink with query parameters containing attacks  
<https://example.com/?q=![test](javascript:alert('query'))>

## Autolink with authority containing attacks
<https://![test](javascript:alert('authority'))@example.com>

## Autolink with port containing attacks
<https://example.com:![test](javascript:alert('port'))>

## Autolink with path containing attacks
<https://example.com/![test](javascript:alert('path'))>

## Autolink with username containing attacks
<https://![test](javascript:alert('user')):pass@example.com>

## Autolink with password containing attacks
<https://user:![test](javascript:alert('pass'))@example.com>

## Autolink that becomes dangerous after normalization sanitization
<https://example.com/../![test](javascript:alert('traversal'))>

## Multiple autolinks on same line
<https://example.com/![a](javascript:alert('a'))> and <https://example.com/![b](javascript:alert('b'))>

## Autolink inside other markdown syntax
**<https://example.com/![test](javascript:alert('bold'))>**

## Autolink with nested brackets
<https://example.com/[![nested](javascript:alert('nested'))](evil.com)>

## Autolink with reference-style attack
<https://example.com/![ref][evil]>

[evil]: javascript:alert('ref-evil')

## Autolink with malformed markdown
<https://example.com/![incomplete

## Autolink with encoded brackets
<https://example.com/%21%5Btest%5D%28javascript:alert%28%27encoded%27%29%29>

## Autolink with unicode brackets
<https://example.com/［test］（javascript:alert（'unicode'））>

## Autolink splitting across normalization boundary
<https://example.com/![test](java
script:alert('split'))>