function flatten(ary){
	var resultArray = [];

	var elm;
	for (var i = 0; i < ary.length; i++) {
		elm = ary[i];
		if(Array.isArray(elm)){
			resultArray = resultArray.concat(flatten(elm));
		}else{
			resultArray.push(elm);
		}
	};

	return resultArray;
}

function Generate(source, node){
	var level = 1;
	return generate_hsh_for(source, node);

	function source_for_node(source, node){
		return source.substr(node.start, node.length);
	}	

	function generate_definition(source, node){
		var definitionNameNode = node.children[0];
		var name = source_for_node(source, definitionNameNode);
		var description = generate_description(source, node.children[1], name);
		return description;
	}

	function spaces(){
		str = "";
		for (var i = 0; i < level - 1; i++) {
			str = str + " ";
		};
		return str;
	}
	function generate_hsh_for(source, node){
		var hsh = {name: null};
		level = level + 1;
		try{
			switch(node.name){
				case "Yertle":
					var result = [];
					for (var i = 0; i < node.children.length; i++) {
						var child = node.children[i];
						hsh = generate_hsh_for(source, child);
						//EOF doesn't generate anything, nor should it!
						if(hsh){
							result[i] = hsh;
						}
					};
					return result;
					break;
				case "Definition":
					return generate_definition(source, node);
					break;
				case "Atom":
					return generate_hsh_for(source, node.children[0]);
					break;
				case "Name":
					hsh.kind = "ByName";
					hsh.matching = source_for_node(source, node);
					return hsh;
					break;
				case "StringLiteral":
					hsh["kind"] = "Literal";
					var src = source_for_node(source, node);
					//take off quotes.
					src = src.substr(1, src.length - 2);
					var result = "";
					for (var i = 0; i < src.length; i++) {
						character = src.charAt(i);
						if(character == '\\'){
							result = result.concat(src.charAt(i+1));
							i = i + 2;
						}else{
							result = result.concat(character);
						}
					};
					hsh["matching"] = result;
					return hsh;
					break;
				case "Precedence":
				case "Description":
				case "Sequence":
					if(node.children.length > 1){
						var children = [];
						for (var i = 0; i < node.children.length; i++) {
							children[i] = generate_hsh_for(source, node.children[i]);
						};						
						children = flatten(children);
						node.children = children;
						if(children.length > 1){
							hsh.kind = "Sequence";
							hsh.matching = children;
						}else if(children.length == 1){
							hsh = children[0];
							hsh.name = node.name;
						}else{
							throw node;
						}

						return hsh;
					}else{
						hsh = generate_hsh_for(source, node.children[0]);
						return hsh;
					}
					break;
				case "Repitition":
				case "Negation":
				case "Optional":
					if(node.children.length == 1){
						var child_hsh = generate_hsh_for(source, node.children[0]);
						hsh.kind = node.name;
						hsh.matching = child_hsh;
						return hsh;
					}else{
						throw "execting only one child of "+node.name+" node."
					}
					break;
				case "Choice":
					if(node.children.length > 1){
						hsh.kind = "Alternation";
						var children = [];
						for (var i = 0; i < node.children.length; i++) {
							children[i] = generate_hsh_for(source, node.children[i]);
						};						
						children = flatten(children);
						node.children = children;
						hsh.matching = children;
						return hsh;
					}else{
						console.log(node);
						console.log(source_for_node(source, node));
						console.log(node.children);
						throw "expecting more than one child of choice node";
					}
					break;
				case "EOF":
					break;
				default:
					console.log(node);
					console.log(source_for_node(source, node));
					var err = ["No such generator: ", (node.name||"null"), " \n"].join("");
					throw new Error(err);
			} 
		}finally {
			level = level - 1;
		}
	}

	function generate_description(source, node, name){
		switch(node.children.length){
			case 1:
				var hsh = generate_hsh_for(source, node.children[0]);
				hsh.name = name;
				return hsh;
				break;
			default:
				var children = [];
				for (var i = 0; i < node.children.length; i++) {
					children[i] = generate_hsh_for(source, node.children[i]);
				};						
				children = flatten(children);
				node.children = children;
				var hsh = {name: name, kind:"Sequence", "matching": children};
				return hsh;
				break;
		}
	}
}

module.exports.Generate = Generate;
exports.Generate = Generate;
module.Generate = Generate;
