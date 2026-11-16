# Image Data URI Variants

## SVG with script injection
![test](data:image/svg+xml,<svg onload="alert('svg')" xmlns="http://www.w3.org/2000/svg"></svg>)

## SVG with base64 encoding
![test](data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KCdzdmctYjY0JykiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+)

## HTML data URI
![test](data:text/html,<script>alert('html')</script>)

## HTML data URI with charset
![test](data:text/html;charset=utf-8,<script>alert('charset')</script>)

## JavaScript data URI
![test](data:application/javascript,alert('js'))

## Data URI with whitespace
![test](data: image/svg+xml,<svg onload="alert('space')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Data URI with tabs
![test](data:	image/svg+xml,<svg onload="alert('tab')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Data URI with newlines
![test](data:
image/svg+xml,<svg onload="alert('newline')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Mixed case data URI
![test](DaTa:ImAgE/sVg+XmL,<svg onload="alert('case')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Data URI with parameters
![test](data:image/svg+xml;param=value,<svg onload="alert('param')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Invalid base64 with fallback
![test](data:image/svg+xml;base64,invalid<svg onload="alert('invalid')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Data URI with encoded characters
![test](data:image/svg%2Bxml,%3Csvg%20onload%3D%22alert%28%27encoded%27%29%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3C/svg%3E)

## Nested data URIs
![test](data:text/html,<img src="data:image/svg+xml,<svg onload='alert(\"nested\")' xmlns='http://www.w3.org/2000/svg'></svg>">)

## Data URI with CDATA
![test](data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><script><![CDATA[alert('cdata')]]></script></svg>)

## Data URI with XML entities
![test](data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" onload="&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#101;&#110;&#116;&#105;&#116;&#121;&#39;&#41;"></svg>)

## Data URI with comments
![test](data:image/svg+xml,<!--comment--><svg onload="alert('comment')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Data URI with processing instructions
![test](data:image/svg+xml,<?xml version="1.0"?><svg onload="alert('pi')" xmlns="http://www.w3.org/2000/svg"></svg>)

## Data URI with DOCTYPE
![test](data:image/svg+xml,<!DOCTYPE svg><svg onload="alert('doctype')" xmlns="http://www.w3.org/2000/svg"></svg>)