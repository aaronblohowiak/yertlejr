function Generate(source, node){
	var escape_function =
        "function html_escape(src){ return (src+'').replace(/&/g, '&amp;')" +
        ".replace(/</g, '&lt;')" +
        ".replace(/>/g, '&gt;')" +
        ".replace(/\"/g, '&quot;')" +
        ".replace(/'/g, '&#x27;')" +
        ".replace(/\\//g,'&#x2F;');\n"+
        "return src }";

    var preamble = "var __$output = [];" + escape_function;
	var post = "__$output = __$output.join('');";

	return preamble + generate_src_for(source, node) + post;

	function jsEscape(src){
		return (src+'').replace(/"/g, '\\"').replace(/\n/g, "\\n");
	}

	function source_for_node(source, node){
		return source.substr(node.start, node.length);
	}

	function generate_src_for(source, node){
		switch(node.name){
			case "EJS":
				var result = [];
				for (var i = 0; i < node.children.length; i++) {
					var src = generate_src_for(source, node.children[i]);
					result[i] = src;
				};
				return result.join("");
				break;
			case "Content":
				return "; __$output.push(\"" + jsEscape(source_for_node(source, node)) + '");';
			case "Interpreted":
				return generate_src_for(source, node.children[0]);
				break;
			case "Escaped":
				return '; __$output.push(html_escape('+source_for_node(source, node.children[0])+'));';
			case "Raw":
				return "; __$output.push("+source_for_node(source, node.children[0])+");";
			case "Evaluated":
				return source_for_node(source, node.children[0]);
			case "EOF":
				break;
			default:
				var err = ["No such generator: ", (node.name||"null"), " \n"].join("");
				throw new Error(err);
		}
	}
}

exports.Generate = Generate;