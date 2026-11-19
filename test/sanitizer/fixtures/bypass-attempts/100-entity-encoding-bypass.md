# Entity Encoding Bypass Attempts

## Test 1: Mixed HTML Entity and Hex Entity Encoding
[Click here](&amp;#x6a;&amp;#x61;v&amp;#x61;script&amp;#x3a;alert&amp;#x28;1&amp;#x29;)

## Test 2: Entity Encoding in Link Text
[&amp;#x6a;&amp;#x61;vascript&amp;#x3a;alert&amp;#x28;1&amp;#x29;](https://example.com)

## Test 3: Double Entity Encoding
[Click here](&amp;amp;#x6a;&amp;amp;#x61;vascript&amp;amp;#x3a;alert&amp;amp;#x28;1&amp;amp;#x29;)

## Test 4: Decimal Entity Encoding
[Click here](&amp;#106;&amp;#97;&amp;#118;&amp;#97;&amp;#115;&amp;#99;&amp;#114;&amp;#105;&amp;#112;&amp;#116;&amp;#58;&amp;#97;&amp;#108;&amp;#101;&amp;#114;&amp;#116;&amp;#40;&amp;#49;&amp;#41;)

## Test 5: Mixed Case Entity Names
[Click here](&AMP;#x6A;&AMP;#x61;vascript&AMP;#x3A;alert&AMP;#x28;1&AMP;#x29;)

## Test 6: HTML Entity in Image Alt
![&amp;#x6a;&amp;#x61;vascript&amp;#x3a;alert&amp;#x28;1&amp;#x29;](https://example.com/image.png)

## Test 7: Incomplete Entity Encoding
[Click here](&amp#x6a;&amp#x61;vascript&amp#x3a;alert&amp#x28;1&amp#x29;)

## Test 8: Entity Encoding with Missing Semicolon
[Click here](&amp;#x6a&amp;#x61vascript&amp;#x3aalert&amp;#x281&amp;#x29)