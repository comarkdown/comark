# Streaming and Boundary Entity Attacks

## Test 1: Entity Encoding Split Across Chunks
[Click here](java&
3a;alert&
28;1&
29;)

## Test 2: Incomplete Entity at Chunk Boundary
[Click here](javascript&3

## Test 3: Mixed Newlines with Entity Encoding
[Click here](java\nscript&3a;alert&28;1&29;)

## Test 4: Carriage Return Confusion
[Click here](java\rscript&3a;alert&28;1&29;)

## Test 5: Tab Character with Entity Encoding
[Click here](java	script&3a;alert&28;1&29;)

## Test 6: Multiple Whitespace Types
[Click here](java script&3a;alert&28;1&29;)

## Test 7: Buffer Boundary Attack
[Click here](javascript&3a;alert&28;" + "1" + "&29;)

## Test 8: Long Entity Chain Boundary
[Click here](&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;&26;3a;javascript&3a;alert&28;1&29;)

## Test 9: Entity Encoding with Line Continuation
[Click here](javascript&\
3a;alert&\
28;1&\
29;)

## Test 10: Form Feed Character
[Click here](javascript&3a;alert&28;1&29;)

## Test 11: Null Byte with Entity Encoding
[Click here](javascript\x00&3a;alert&28;1&29;)

## Test 12: Streaming Autolink Confusion
<javascript&3a;alert&28;1&29;
>