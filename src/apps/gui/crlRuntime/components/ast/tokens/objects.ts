import {
	AstDictNode,
	AstListNode,
	AstNode,
	AstStringNode,
	removeBlanks
} from "../../definitions.js";
import AstGenerator from "../ast.js";
import { tokenBasedSplit, tokenise } from "../tokenise.js";

export default class ObjectTokenAstGenerator {
	constructor(public generator: AstGenerator) {}
	generateListAst(token: string, debug: typeof console.debug) {
		const obj: AstListNode = {
			type: "list",
			value: removeBlanks(
				tokenise(token.substring(1, token.length - 1))
			).map((item) => this.generator.generateTokenAST(item, debug))
		};

		return obj;
	}
	generateDictAst(token: string, debug: typeof console.debug) {
		const obj: AstDictNode = {
			type: "dict",
			value: new Map()
		};

		const open = token.textAfter("#{").textBeforeLast("}");
		// debugging
		debug("Open dict is", open);

		const tokens = tokenise(open);
		debug("Dict tokens are", tokens);

		const data = removeBlanks(tokens).map((item) => {
			{
				return tokenBasedSplit(item, ":");
			}
		});

		debug("Dict segmented and split is", data);

		for (const set of data) {
			debug("Considering set", set);

			if (set.length !== 2) {
				throw new Error(
					`Object found with ${set.length} tokens. only 2 way splits are valid.`
				);
			}

			const key: AstStringNode = { type: "str", value: set[0] };
			const value: AstNode = this.generator.generateTokenAST(
				set[1].trim(),
				debug
			);

			debug("Set result is", key, ":", value);

			obj.value.set(key, value);
		}

		return obj;
	}
}
