import { generateAST } from "../ast/ast.js";
import { AstNode } from "../definitions.js";
import { LanguageRuntime } from "../runtime/runtime.js";

export default class LanguageInstance {
	ast: AstNode[];
	runtime: LanguageRuntime;

	constructor(public code: string) {
		this.ast = generateAST(code);

		this.runtime = new LanguageRuntime(this.ast);
	}

	frame() {}
}
