assert = require("assert");
fs = require("fs");
basedir = "../";
Yertle = require(basedir + "yertlejr.js").Yertle;	

var Literal = Yertle.Matchers.Literal,
	Repitition = Yertle.Matchers.Repitition,
	Alternation = Yertle.Matchers.Alternation,
	Sequence = Yertle.Matchers.Sequence,
	Negation = Yertle.Matchers.Negation,
	Optional = Yertle.Matchers.Optional,
	ByName = Yertle.Matchers.ByName;

(function CompoundTest(){
	(function test_simpler_sequence_regression(){
		var str = "B C",
			basic = Alternation.init([Literal.init("B", "B"), Literal.init("C", "C")], "B or C")
			sp = Literal.init(" ", "Space")
			seq = Sequence.init([
				basic,
				Optional.init(
					Sequence.init([
						Repitition.init(
							Sequence.init([Sequence.init([sp, basic], "inner")], "Wrapping inner seq"),
							"Repitition"
						)
					], "middle sequence"),
					"Optionalal second letter"
				)
			], "Outer Seq"),
			result =  seq.perform_match(str, 0);

		assert(result.length == str.length, "Should match whole string");
	})();

	(function test_the_sequence_sample_regression(){
		var str = "A:B C",
			name = Literal.init("A"),
			basic = Alternation.init([Literal.init("B"),Literal.init("C")]),
			sp = Literal.init(" "),
			sep = Literal.init(":"),
			seq = Sequence.init([
				basic,
				Optional.init(
					Sequence.init([
						Repitition.init(
							Sequence.init([Sequence.init([sp, basic])])
						)
					])
				)
			]),
			fmt = Sequence.init([
				name,
				sep,
				seq
			]),
			result = fmt.perform_match(str, 0);
		assert(result.length == str.length, "Should match whole string");
	})();
})();