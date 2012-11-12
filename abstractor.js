//Accept a syntax tree from a yertle grammar and abstact it. This will leave behind named nodes, basically.

function Abstractor(syntax_tree){
	function remove_abstraction(node, fn){
		if(!node["children"]) return node;

		var new_children = [],
			child = null;

		for (var i = 0; i < node.children.length; i++) {
			child = node.children[i];
			new_children[i] = remove_abstraction(child, fn);
		};

		node.children = new_children;
		var result = fn(node);
		return result;
	}

	function prune_nameless_empty_children(node){
		var new_children = [],
			child = null;
		for (var i = 0; i < node.children.length; i++) {
			child = node.children[i];
			if(child.name || child.children.length > 0){
				new_children.push(child);
			}
		}
		node.children = new_children;
		return node;
	}

	function collapse_nameless_single_children(node){
		if(!node.name && node.children.length == 1){
			node = node.children[0];
		}
		return node;
	}

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

	function remove_nameless_intermediary_nodes(node){
		node.children = flatten(node.children);

		if(!node.name && node.children.length > 1){
			node = node.children;
		}
		return node;
	}

	var simplifications = [
		prune_nameless_empty_children,
		collapse_nameless_single_children,
		remove_nameless_intermediary_nodes
	]

	for (var i = 0; i < simplifications.length; i++) {
		fn = simplifications[i];
		node = remove_abstraction(syntax_tree, fn);
	};

	return node;
}

module.exports.Abstractor = exports.Abstractor = module.Abstractor = Abstractor;