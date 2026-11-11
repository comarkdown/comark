# Hex Entity Encoding Confusion

## Test 1: Protocol Confusion with Hex Entities
[Click here](&5c;x6a;&5c;x61;vascript&5c;x3a;alert&5c;x28;1&5c;x29;)

## Test 2: Backslash Entity Encoding Bypass
[Click here](java&5c;script&5c;:alert&5c;(1&5c;))

## Test 3: Mixed Backslash and Standard Encoding
[Click here](j&5c;a&5c;v&5c;a&5c;s&5c;c&5c;r&5c;i&5c;p&5c;t&5c;:&5c;a&5c;l&5c;e&5c;r&5c;t&5c;(&5c;1&5c;))

## Test 4: Double Backslash Entity Encoding
[Click here](&5c;&5c;x6a;&5c;&5c;x61;vascript&5c;&5c;x3a;alert&5c;&5c;x28;1&5c;&5c;x29;)

## Test 5: Backslash in Markdown Syntax
[&5c;[nested&5c;]](javascript:alert(1))

## Test 6: Colon Entity Bypass
[Click here](javascript&3a;alert(1))

## Test 7: Parentheses Entity Bypass
[Click here](javascript:alert&28;1&29;)

## Test 8: Forward Slash Entity Bypass
[Click here](data&3a;text&2f;html,&3c;script&3e;alert(1)&3c;&2f;script&3e;)