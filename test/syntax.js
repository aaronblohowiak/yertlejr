assert = require("assert");
fs = require("fs");
basedir = "../";
Yertle = require(basedir + "yertlejr.js").Yertle;
Generate = require(basedir + "generator.js").Generate;

Abstractor = require("../abstractor.js").Abstractor;

json = JSON.parse(fs.readFileSync("./yertle.json", "utf-8"));
context = Yertle.deserializeGrammar(json);
source = fs.readFileSync("./test/yertle-basic.yrt", "utf-8");
result = context.match("Yertle", source, 0);

nonAbstract = JSON.stringify(result.node);

abstract = JSON.stringify(Abstractor(result.node));
assert(nonAbstract.length > abstract.length, JSON.stringify(result.node).length + " should be longer than "+abstract.length);

ast = JSON.parse(abstract); //deep copy!

var ary = Generate(source, ast);

function compare(a, b){
	 var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
	 if (nameA < nameB) //sort string ascending
	  return -1 
	 if (nameA > nameB)
	  return 1
	 return 0 //default return value (no sorting)
}

ary.sort(compare);
json.sort(compare);

assert.deepEqual(ary, json);
