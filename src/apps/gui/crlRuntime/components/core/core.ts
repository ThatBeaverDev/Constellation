import CrlRunner from "../../tcpsys/app.js";
import { generateAST } from "../ast/ast.js";
import { AstNode } from "../definitions.js";
import { CrlRuntime } from "../runtime/runtime.js";

export default class CrlRunnerInstance {
	ast: AstNode[];
	runtime: CrlRuntime;

	constructor(
		public code: string,
		public parent: CrlRunner,
		public logs?: any[]
	) {
		this.ast = generateAST(code);

		parent.env.debug(this.ast);

		this.runtime = new CrlRuntime(this.ast, this);
	}

	log(...optionalData: any[]) {
		if (this.logs) {
			this.logs.push(optionalData);
		} else {
			this.parent.env.log(...optionalData);
		}
	}

	frame() {}
}
