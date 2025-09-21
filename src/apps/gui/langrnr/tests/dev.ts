import { generateAST } from "../components/ast/ast.js";

String.prototype.textAfter = function (after) {
	return this.split(after).splice(1, Infinity).join(after);
};

String.prototype.textAfterAll = function (after) {
	return this.split(after).pop() ?? "";
};

String.prototype.textBefore = function (before) {
	return this.substring(0, this.indexOf(before));
};

String.prototype.textBeforeLast = function (before) {
	return this.split("")
		.reverse()
		.join("")
		.textAfter(before)
		.split("")
		.reverse()
		.join("");
};

const code =
	'// tester\n\nconst a = 5\nconst b = 7\n\nif (b > a) {\n\tprintln("B is greater than A")\n}\nif (b < a) {\n\tprintln("A is greater than B")\n}\n\nprintln(a)\nprintln(b)';

const ast = generateAST(code);

console.log(JSON.stringify(ast, null, 4));
