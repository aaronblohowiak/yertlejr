
simple:
	node test/simple.js

compound:
	node test/compound.js

serialization:
	node test/serialization.js

grammar:
	node test/grammar.js

syntax:
	node test/syntax.js

ejs:
	node examples/ejs/test.js

test: simple compound serialization grammar syntax

.PHONY: test simple compound serialization grammar syntax