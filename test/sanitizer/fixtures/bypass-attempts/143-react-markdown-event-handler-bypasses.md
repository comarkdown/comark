<div onmouseover="alert('mouseover')" onmouseout="alert('mouseout')">Hover me</div>

<span onkeydown="alert('keydown')" tabindex="0">Press key</span>

<img src="data:," onfocus="alert('focus')" tabindex="0">

<a href="#" ondblclick="alert('double click')">Double click</a>

<input type="text" onfocus="alert('input focus')" onblur="alert('input blur')">

<button type="button" onclick="alert('button click')">Click</button>

<form onsubmit="alert('form submit'); return false;">
  <input type="submit" value="Submit">
</form>

<video controls onplay="alert('video play')" onpause="alert('video pause')">
  <source src="movie.mp4" type="video/mp4">
</video>

<audio controls onvolumechange="alert('volume change')">
  <source src="audio.mp3" type="audio/mpeg">
</audio>

<canvas width="100" height="100" onclick="alert('canvas click')"></canvas>

<iframe src="about:blank" onload="alert('iframe load')"></iframe>

<object data="data.pdf" onload="alert('object load')"></object>

<embed src="flash.swf" onload="alert('embed load')">

<details ontoggle="alert('details toggle')">
  <summary>Toggle me</summary>
  Content here
</details>