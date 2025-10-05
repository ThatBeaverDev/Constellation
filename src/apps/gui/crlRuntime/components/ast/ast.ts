import { AstNode, AstVariableNode, removeBlanks } from "../definitions.js";
import { removeComments } from "./comments.js";
import { tokenBasedSplit } from "./tokenise.js";
import { getTokenType } from "./types.js";
import ObjectTokenAstGenerator from "./tokens/objects.js";
import BasicTokenAstGenerator from "./tokens/basics.js";
import CodeTokenAstGenerator from "./tokens/code.js";

export default class AstGenerator {
	basics: BasicTokenAstGenerator;
	objects: ObjectTokenAstGenerator;
	code: CodeTokenAstGenerator;
	constructor() {
		this.basics = new BasicTokenAstGenerator(this);
		this.objects = new ObjectTokenAstGenerator(this);
		this.code = new CodeTokenAstGenerator(this);
	}

	generateAST(
		code: string,
		debug: typeof console.debug = (...args: any[]) => {}
	) {
		const lines = removeBlanks(
			tokenBasedSplit(code, ";").map((line) => removeComments(line))
		);

		debug(lines);

		const ast = [];
		for (const line of lines) {
			const lineAst = this.generateLineAST(line, debug);

			debug("AST for line:" + line + " is ", lineAst);

			ast.push(lineAst);
		}

		return ast;
	}
	generateLineAST(line: string, debug: typeof console.debug) {
		return this.generateTokenAST(line, debug);
	}
	generateTokenAST(token: string, debug: typeof console.debug): AstNode {
		debug("Getting token type of '" + token + "'");
		const type = getTokenType(token);

		debug("typeof", token, "is", type);

		switch (type) {
			case "str": {
				return this.basics.generateStringAst(token, debug);
			}
			case "num": {
				return this.basics.generateNumberAst(token, debug);
			}
			case "bool": {
				return this.basics.generateBooleanAst(token, debug);
			}

			case "operation": {
				return this.code.generateOperationAst(token, debug);
			}

			case "list": {
				return this.objects.generateListAst(token, debug);
			}

			case "dict": {
				return this.objects.generateDictAst(token, debug);
			}

			case "block": {
				return this.code.generateBlockTypeAst(token, debug);
			}

			case "property": {
				return this.code.generatePropertyAst(token, debug);
			}

			case "var": {
				const obj: AstVariableNode = {
					type: "var",
					value: String(token)
				};

				return obj;
			}

			case "code": {
				return this.code.generateCodeAst(token, debug);
			}
		}

		throw new Error(
			"Type '" + type + "' was not handled in token generation."
		);
	}
}
