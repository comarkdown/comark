# Turndown Conversion Attacks

## HTML img with malicious attributes that survive conversion
<img src="/safe.jpg" data-malicious="javascript:alert('data')" title="![](javascript:alert('title'))" />

## HTML with custom attributes
<img src="/safe.jpg" onclick="alert('click')" onload="alert('load')" />

## HTML img with style injection
<img src="/safe.jpg" style="background:url(javascript:alert('style'))" />

## HTML with script-like attributes
<img src="/safe.jpg" href="javascript:alert('fake-href')" />

## HTML img with malformed attributes
<img src="/safe.jpg" malformed"javascript:alert('malformed')" />

## HTML with XML namespaces
<img xmlns:evil="http://evil.com" evil:src="javascript:alert('xmlns')" src="/safe.jpg" />

## HTML img with data URIs in attributes
<img src="/safe.jpg" longdesc="data:text/html,<script>alert('longdesc')</script>" />

## HTML with event handlers
<img src="/safe.jpg" onerror="alert('error')" onabort="alert('abort')" />

## HTML img with malicious usemap
<img src="/safe.jpg" usemap="#javascript:alert('usemap')" />

## HTML with form-related attributes
<img src="/safe.jpg" form="malicious" formaction="javascript:alert('form')" />

## HTML img with accessibility attributes containing script
<img src="/safe.jpg" aria-label="<script>alert('aria')</script>" />

## HTML with microdata attributes
<img src="/safe.jpg" itemscope itemtype="javascript:alert('microdata')" />

## HTML img with custom data attributes
<img src="/safe.jpg" data-src="javascript:alert('data-src')" data-original="javascript:alert('original')" />

## HTML with malicious class names
<img src="/safe.jpg" class="javascript:alert('class')" />

## HTML img with id containing script
<img src="/safe.jpg" id="javascript:alert('id')" />

## HTML with deprecated attributes
<img src="/safe.jpg" language="javascript" type="text/javascript" />

## HTML img with malicious crossorigin
<img src="/safe.jpg" crossorigin="javascript:alert('crossorigin')" />

## HTML with referrer policy injection
<img src="/safe.jpg" referrerpolicy="javascript:alert('referrer')" />

## HTML img with malicious sizes attribute
<img src="/safe.jpg" sizes="javascript:alert('sizes')" />

## HTML with srcset injection
<img src="/safe.jpg" srcset="javascript:alert('srcset')" />

## HTML img with malicious loading attribute
<img src="/safe.jpg" loading="javascript:alert('loading')" />

## HTML with decoding injection
<img src="/safe.jpg" decoding="javascript:alert('decoding')" />

## HTML img with malicious fetchpriority
<img src="/safe.jpg" fetchpriority="javascript:alert('fetchpriority')" />

## HTML with contenteditable injection
<img src="/safe.jpg" contenteditable="javascript:alert('contenteditable')" />

## HTML img with malicious draggable
<img src="/safe.jpg" draggable="javascript:alert('draggable')" />

## HTML with spellcheck injection
<img src="/safe.jpg" spellcheck="javascript:alert('spellcheck')" />

## HTML img with malicious translate
<img src="/safe.jpg" translate="javascript:alert('translate')" />

## HTML with role injection
<img src="/safe.jpg" role="javascript:alert('role')" />

## HTML img with malicious tabindex
<img src="/safe.jpg" tabindex="javascript:alert('tabindex')" />

## HTML with dir injection
<img src="/safe.jpg" dir="javascript:alert('dir')" />

## HTML img with malicious lang
<img src="/safe.jpg" lang="javascript:alert('lang')" />