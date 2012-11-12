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

(function (){
	(function test_simple_roundtrip_literal(){
		var src = Literal.init("\n", "newline").to_matcher_hsh(),
			src_json = JSON.stringify(src),
			result = Literal.deserialize(JSON.parse(src_json)),
			result_hsh = result.to_matcher_hsh();

		assert(src_json == JSON.stringify(result_hsh));
		assert(result.name == "newline");
		assert(result.match("\n", 0).status);
	})();

	(function test_repitition_roundtrip(){
		var src = Repitition.init(Literal.init("a", "One A"), "Many As"),
			src_hsh = src.to_matcher_hsh(),
			src_json = JSON.stringify(src_hsh),
			result = Repitition.deserialize(JSON.parse(src_json)),
			result_hsh = result.to_matcher_hsh();

		assert(src_json == JSON.stringify(result_hsh), "jsons must match")
		assert(result.match("aaaa", 0).length == 4)
		assert(Repitition.registry["Repitition"] == Repitition);
	})();

	(function test_simple_roundtrip_negation_by_name(){
		var context = new Yertle.Context();
		Literal.init("0", "0", context);
		src = Negation.init(ByName.init("0", false, context), "NonZero", context);
		src_hsh = src.to_matcher_hsh();
		src_json = JSON.stringify(src_hsh);
		result = Negation.deserialize(JSON.parse(src_json), context)
		result_hsh = result.to_matcher_hsh();
		assert(src_json == JSON.stringify(result_hsh), "jsons must match");
		assert(result.match("101", 0).status);
		assert(result.match("101", 1).status == false);
	})();

	(function (){
		var src = Sequence.init([
				Literal.init("A"),
				Literal.init("B"),
				Repitition.init(Literal.init("!")),
				Literal.init("B"),
				Optional.init(Literal.init("?"))
			]),
			src_hsh = src.to_matcher_hsh(),
			src_json = JSON.stringify(src_hsh),
			result = Sequence.deserialize(JSON.parse(src_json)),
			result_hsh = result.to_matcher_hsh();

		assert.deepEqual(src_json, JSON.stringify(result_hsh));
		assert(result.match("AB!!!B", 0).status == true);
		assert(result.match("AB!!!B?", 0).status == true);
		assert(result.match("AB!!!B", 1).status == false);
	})();
})();