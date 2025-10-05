import {
	AstBooleanNode,
	AstNumberNode,
	AstStringNode
} from "../../definitions.js";
import AstGenerator from "../ast.js";

export default class BasicTokenAstGenerator {
	constructor(public generator: AstGenerator) {}

	generateStringAst(token: string, debug: typeof console.debug) {
		const obj: AstStringNode = {
			type: "str",
			value: token.substring(1, token.length - 1)
		};

		return obj;
	}
	generateNumberAst(token: string, debug: typeof console.debug) {
		let num = Number(token);
		if (token == "infinity") {
			num = Infinity;
		}

		const obj: AstNumberNode = {
			type: "num",
			value: num
		};

		return obj;
	}
	generateBooleanAst(token: string, debug: typeof console.debug) {
		const obj: AstBooleanNode = {
			type: "bool",
			value: token == "true"
		};

		return obj;
	}
}
