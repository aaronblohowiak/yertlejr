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

(function TestLiteral(){
	(function SimpleLiteral(){
		var matcher = Literal.init("bob"),
			result = matcher.match("bob", 0, {});
		
		assert(result.status);
	})();

	(function SimpleLiteralFail(){
		var matcher = Literal.init("bob"),
			result = matcher.match("boo", 0, {});
		
		assert(!result.status);
		assert(!result.node);
	})();

	(function TestMatchBeginnings(){
			var matcher = Literal.init("aaron"),
				result = matcher.match("aaronpalooza", 0);

			assert(result.status);
			assert(result.length === "aaron".length);
			assert(result.node.length == "aaron".length);
			result = matcher.match("01234aaron", 5);
			assert(result.status);
			assert(result.node.start == 5);
	})();

	(function Testvalue(){
		var matcher = Literal.init("function"),
		str = "function (",
		result = matcher.match(str, 0);

		assert.deepEqual(result.node.children, []);
		assert(result.node.length == "function".length);
		var	start = result.node.start;
		var length = result.node.length;

		assert(str.substr(start, length) == "function");
		matcher = Literal.init("function");
		str = "; function (";
		result = matcher.match(str, 2);

		assert(result.node.length == "function".length)
		start = result.node.start;
		length = result.node.length;
		assert(str.substr(start, length) == "function");
	})();
})();

(function TestRepitionMatcher(){
	function create_literal_matcher(){
		return Literal.init("abc");
	}

	(function TestSimpleMatch(){
		var matcher = Repitition.init(create_literal_matcher()),
			result = matcher.match("abc",0);
		assert(result.status);
		assert(result.node.children.length == 1);
	})();

	(function TestManyRepeats(){
		var prelude = "abc intro ",
			epilogue = " outro abc",
			str=prelude;

		var inside = "";
		for (var i = 0; i < 42; i++) {
			inside += "abc";
		};
		str += inside + epilogue;

		var matcher = Repitition.init(create_literal_matcher()),
			result = matcher.match(str, prelude.length);
		
		assert(result.status);
		nodeList = result.node.children;

		assert(nodeList.length == 42);
		assert(nodeList[0].length == "abc".length);
		assert(nodeList[41].length == "abc".length);
		assert(nodeList[5].start == prelude.length + 5 * "abc".length);
	})();

})();

(function TestAlternation(){
	(function TestAlternativeLiterals(){
		var aaron = Literal.init("apb"),
			maeve = Literal.init("maeve"),
			str = "apbmaeve",
			str2 = "maeveapb",
			matcher = Alternation.init([aaron, maeve]),
			result = matcher.match(str, 0);

		assert(result.status);
		//precedence is order
		var start = result.node.children[0].start,
			length = result.node.children[0].length;

		assert(str.substr(start, length) == "apb");
		assert(result.node.length == 3);
		
		result = matcher.match(str, 3);
		start = result.node.children[0].start,
		length = result.node.children[0].length;
		assert(str.substr(start, length) == "maeve");

		result = matcher.match(str, 4);
		assert(!result.node);

		result = matcher.match(str2, 0);
		start = result.node.children[0].start,
		length = result.node.children[0].length;
		assert.equal(str2.substr(start, length), "maeve");
	})();

	(function test_compound_repeater_and_alternative(){
		var maeve = Literal.init("maeve"),
			bangs = Repitition.init(Literal.init("!")),
			str = "!maeve!!!!",
			matcher = Alternation.init([maeve, bangs]),
			result = matcher.match(str, 0);

		assert(result.node.children[0].children[0].length == 1);
	
		result = matcher.match(str, 1);
		assert(result.node.children[0].length == "maeve".length);

		result = matcher.match(str, 4);
		assert(!result.status);

		result = matcher.match(str, 6);

		assert(result.node.children[0].length == 4);
	})()
})();

(function TestSequenceMatcher(){
	(function test_simple_sequence(){
		var str = "1 a bbbbbbb c",
			str2 = "1 a 2 c",
			one = Literal.init("1"),
			a = Literal.init("a"),
			bOr2 = Alternation.init([
				Repitition.init(Literal.init("b")),
				Literal.init("2")
			]),
			c = Literal.init("c"),
			space = Literal.init(" "),
			matcher = Sequence.init([
				one, space,
				a, space,
				bOr2, space,
				c
			]),
			result = matcher.match(str, 0);

		assert(result.status);
		assert(result.node.kind == "Sequence")
		var node_list = result.node.children;
		// bbbbbbb
		assert(node_list[4].start == 4)
		assert(node_list[4].length == 7)
	})();

})();

(function TestNegation(){
	var aaron = Literal.init("aaron"),
		z = Literal.init("z"),
		result = (Negation.init(aaron)).match("zzaaron", 0);

	assert(result.status);
	assert(result.length == 1);

	result = (Negation.init(aaron)).match("zzaaron", 2);
	assert( result.status == false);
	assert( result.length == 0);

	result = ( Negation.init(z)).match("zzaaron", 0);
	assert(result.status == false);

	result = (Negation.init(z)).match("zzaaron", 4);
	assert(result.status);
})();

(function TestOptional(){
	var a = Literal.init("a"),
		p = Literal.init("p"),
		b = Literal.init("b"),
		middleInitial = Optional.init(p),
		initials = Sequence.init([a, middleInitial, b]),
		str = "apb",
		str2 = "ab",
		str3 = "pb";

	assert(initials.match(str, 0).status);
	assert(initials.match(str2, 0).status);
	assert(!initials.match(str3, 0).status);

})();

(function TestByName(){
	var context = new Yertle.Context();
	Literal.init("aaron", "FirstName", context);
	Literal.init("blohowiak", "LastName", context);
	Sequence.init([
		ByName.init("FirstName", null, context),
		Literal.init(" "),
		ByName.init("LastName", null, context)
	], "FullName", context);

	var fullName = ByName.init("FullName", null, context);

	assert(fullName.match("aaron blohowiak", 0).status);
	assert(!fullName.match("a p blohowiak", 0).status);

	var newContextMatcher = ByName.init("FullName", null, new Yertle.Context());
	var error = false;
	try{
		newContextMatcher.match("aaron blohowiak", 0);	
	}catch(e){
		error = true;
	}
	assert(error);
})();