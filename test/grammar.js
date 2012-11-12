assert = require("assert");
fs = require("fs");
basedir = "../";
Yertle = require(basedir + "yertlejr.js").Yertle;

json = JSON.parse(fs.readFileSync("./yertle.json", "utf-8"));

(function(){
	var context = Yertle.deserializeGrammar(json);

	var str = 'Foo := Bar\n';
	assert(context.namedMatchers["Yertle"].match(str, 0).status);


	str = "Definition := Name ' := ' Description Newline\n";
	assert(context.namedMatchers["Yertle"].match(str, 0).status);

	var basic = fs.readFileSync("./test/yertle-basic.yrt", "utf-8");
	var result = context.namedMatchers["Yertle"].match(basic, 0);

	if(result.length > basic.length){
		console.log("not matched: \n", basic.substr(result.length, basic.length));
	}

	assert(result.length == basic.length); //for right now...
})();
