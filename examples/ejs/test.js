assert = require("assert");
fs = require("fs");
basedir = "../../";
ejsdir = "./examples/ejs/";

Yertle = require(basedir + "yertlejr.js").Yertle;
Abstractor = require(basedir + "abstractor.js").Abstractor;
Generate = require(basedir + "generator.js").Generate;

json = JSON.parse(fs.readFileSync("./yertle.json", "utf-8"));
context = Yertle.deserializeGrammar(json);

source = fs.readFileSync(ejsdir + "ejs.yrt",  "utf-8")
result = context.match('Yertle', source, 0);

nonAbstract = JSON.stringify(result.node);
abstract = Abstractor(result.node);
newMatcher = Generate(source, abstract);

context = Yertle.deserializeGrammar(newMatcher);
exampleSource = fs.readFileSync(ejsdir + "input.ejs",  "utf-8")
result = context.match('EJS', exampleSource, 0);

nonAbstract = JSON.stringify(result.node);
abstract = Abstractor(result.node);

EJSGenerate = require("./ejs.generator.js").Generate;

template = EJSGenerate(exampleSource, abstract);

console.log(eval(template));