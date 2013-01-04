Yertle is:
	A library of text matching primitives
		* De/Serializable from/to JSON
		* Robust enough to implement Pure Regular Expressions
		* match results contain source location information
	An arrangement of those primitives which matches against a BNF-like grammar description.
	An "Abstractor" that simplifies the match result, leaving ony named match groups in the tree
	A "Generator" which takes an abstracted match result from the BNF-like grammar and creates a JSON parser description (making Yertle a meta-parser-generator!)

