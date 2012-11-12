var Yertle = {};
Yertle.Matchers = {};

var matchers = Yertle.Matchers;

Yertle.Context = function(){
	var result = {
		namedMatchers: {},
		match: function(rule, source, position){
			ByName.init(rule, null, this).match(source, position);
		}
	};

	function chars_to_alternating_literals(chars, name){
		var char_array = chars.split("");
		var char_matcher_array = [];

		for (var i = 0; i < char_array.length; i++) {
			var c = char_array[i];
			char_matcher_array.push(Yertle.Matchers.Literal.init(c));
		};

		Yertle.Matchers.Alternation.init(char_matcher_array, name, result)
	}
	

	//Three builtin matchers.
	//	Punctuation
	//	Whitespace
	//	Any (consume any char. Fails on EOF.)
	// 	EOF

	chars_to_alternating_literals("^!\"'`\#$%&()[]{}*+-~_\/|.:;<=>?@", "Punctuation");
	chars_to_alternating_literals(" \t\n", "Whitespace");
	Yertle.Matchers.Negation.init(Yertle.Matchers.EOF, "Any", result);
	Yertle.Matchers.EOF.init(null, "EOF", result);

	return result;
}

function MatchResult(status, length, node){
	var result = {
		"status": status,
		"length": length,
		"node": node
	};
	return result;
}

function Node(kind, name, start, length, children){
	var result = {
		"kind": kind,
		"name": name,
		"start": start,
		"length": length,
		"children": children
	};
	return result;
}

Yertle.deserializeGrammar =  function deserializeGrammar(list){
	var context = new Yertle.Context();
	for (var i = 0; i < list.length; i++) {
		var obj = list[i];
		Yertle.Matchers[obj["kind"]].deserialize(obj, context);
	};
	return context;
};


Matcher = {
	full_log: false,
	log_start: 0,
	kind: "PROTOTYPE",
	registry: Yertle.Matchers,
	init: function init(matching, name, context){
		that = Object.create(this);
		that.matching = matching;
		that.name = name;
		that.context = context;
		if(name && context && context.namedMatchers){
			context.namedMatchers[name] = that;
		} 
		return that;
	},
	perform_match: function default_perform_match(source, position){
		return MatchResult(false, 0, null);
	},
	match: function match(source, position){
		var result;

		if(this.full_log && position >= this.log_start){
			console.log("attempting: "+this.name);

			result = this.perform_match(source, position)

			if(result && result.status)
				console.log("match succeeded "+this.name+" "+position+" ", result);
			else
				console.log("match failed "+this.name+" "+position+" ", result);
		}else{
			result = this.perform_match(source, position);
		}

		return result;
	},
	to_matcher_hsh: function to_matcher_hsh(){
		function dump(matching){
			if(matching["to_matcher_hsh"]){
				return matching.to_matcher_hsh();
			}else{
				return matching;
			}
		}

		var matching = [];

		if(Array.isArray(this.matching)){
			for (var i = 0; i < this.matching.length; i++) {
				var m = this.matching[i];
				matching[i] = dump(m);
			}
		}else{
			matching = dump(this.matching);
		}

		var result = {
			name: this.name,
			kind: this.kind,
			matching: matching
		};

		return result;
	}
}

function newMatcher(name){
	var matcher = Object.create(Matcher);
	matcher.kind = name;
	matchers[name] = matcher;
	return matcher;
};

function deserializeWrappingMatcher(obj, context){
	var matcher = this.registry[obj["matching"]["kind"]].deserialize(obj["matching"], context);
	return this.init(matcher, obj["name"], context);
};

function deserializeArrayMatcher(obj, context){
	var matchers = [];
	for (var i = 0; i < obj.matching.length; i++) {
		subObj = obj.matching[i];
		matchers[i] = this.registry[subObj["kind"]].deserialize(subObj, context);
	};

	return this.init(matchers, obj["name"], context);
}

newMatcher("EOF");
matchers.EOF.perform_match = function(source, position){
	if(position == source.length)
		return new MatchResult(true, 0, new Node(
			"EOF",
			this.name,
			position,
			0,
			[]
		));
	else
		return new MatchResult(false, 0, null);
}

newMatcher("Literal");
matchers.Literal.perform_match = function(source, position){
	var literal = this.matching;
	if((source.length >= position + literal.length) && source.substr(position, literal.length) == literal){
		return new MatchResult(true, literal.length, new Node(
			"Literal",
			this.name,
			position,
			literal.length,
			[]
			));
	}else{
		return new MatchResult(false, 0, null);
	}
}
matchers.Literal.deserialize = function(obj, context){
	return this.init(obj["matching"], obj["name"], context);
}

newMatcher("Repitition");
matchers.Repitition.deserialize = deserializeWrappingMatcher;
matchers.Repitition.perform_match = function(source, position, matchState){
	var child_matcher = this.matching,
		matches = [],
		length = 0,
		original_position = position;
			
		while((result=child_matcher.match(source, position)).status && position <= (source.length + 1)){
				matches.push(result)
				length += result.length;
				position += result.length;
		}

		var match_nodes =[];
		for (var i = matches.length - 1; i >= 0; i--) {
			match_nodes[i] = matches[i].node;
		};

		if(matches.length > 0){
			return new MatchResult(true, length, new Node(
				"Repitition",
				this.name,
				original_position,
				length,
				match_nodes
			));
		} else {
			return new MatchResult(false, 0, null);
		}
}

newMatcher("Alternation");
matchers.Alternation.deserialize = deserializeArrayMatcher;
matchers.Alternation.perform_match = function(source, position){
		var result = null;
		for (var i = 0; i < this.matching.length; i++) {
			var matcher = this.matching[i];
			result = matcher.match(source, position)
			if(result.status)
				break;
		};


		if(result.status){
			return new MatchResult(true, result.length, new Node(
				"Alternation",
				this.name,
				position,
				result.length,
				[result.node]
			));
		}else{
			return new MatchResult(false, 0, null);
		}
}

newMatcher("Sequence");
matchers.Sequence.deserialize = deserializeArrayMatcher;
matchers.Sequence.perform_match = function(source, position){
	var nodes = [],
		original_position = position,
		status = true,
		length = 0;

	for (var i = 0; i < this.matching.length; i++) {
		matcher = this.matching[i];

		var result = matcher.match(source, position);
		if(result.status){
			nodes.push(result.node);
			length += result.length;
			position += result.length;
		}else{
			status = false;
			break;
		}
	};

	if(status){
		return new MatchResult(true, length, new Node(
			"Sequence",
			this.name,
			original_position,
			length,
			nodes
		))
	} else {
		return new MatchResult(false, 0, null)	
	}
}

newMatcher("Negation");
matchers.Negation.deserialize = deserializeWrappingMatcher;
matchers.Negation.perform_match = function(source, position){
	var original_position = position,
		result = this.matching.match(source, position);

	if(result.status){
		return new MatchResult(false, 0, null);
	}else{
		return new MatchResult(true, 1, new Node(
			"Negation",
			this.name,
			position,
			1,
			[]
		));
	}
}

newMatcher("Optional");
matchers.Optional.deserialize = deserializeWrappingMatcher;
matchers.Optional.perform_match = function(source, position){
	var result = this.matching.match(source, position);
	if(result.status){
		return new MatchResult(true, result.length, new Node(
			"Option",
			this.name,
			position,
			result.length,
			[]
		))
	}else{
		return new MatchResult(true, 0, null);
	}
}

newMatcher("ByName");
matchers.ByName.deserialize = function(obj, context){
	return this.init(obj["matching"], obj["name"], context);
}
matchers.ByName.perform_match = function(source, position){
	var matcher;
	if(matcher = this.context.namedMatchers[this.matching]){
		return matcher.match(source, position);
	}else{
		throw "MATCHER NOT FOUND: "+this.matching;
	}
}

module.exports.Yertle = Yertle;
exports.Yertle = Yertle;
module.Yertle = Yertle;