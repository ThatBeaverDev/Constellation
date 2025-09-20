import { generateTokenAST } from "./ast/tokenAst.js";
import { removeBlanks } from "./definitions.js";

export function generateAST(code: string) {
	const lines = removeBlanks(code.split("\n").map((line) => line.trim()));

	const ast = [];
	for (const line of lines) {
		ast.push(generateLineAST(line));
	}

	return ast;
}

function generateLineAST(line: string) {
	return generateTokenAST(line);
}
