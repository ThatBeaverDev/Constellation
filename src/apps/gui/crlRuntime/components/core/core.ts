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
		public logs?: any[],
		public isDebug: boolean = false
	) {
		const debug = isDebug ? this.debug.bind(this) : (...args: any[]) => {};

		this.ast = generateAST(code, debug);

		if (isDebug) {
			parent.env.debug(this.ast);
		}

		this.runtime = new CrlRuntime(this.ast, this, isDebug);
	}

	debug = ((...optionalData: any[]) => {
		if (this.isDebug == false) return;

		if (this.logs) {
			this.logs.push(optionalData);
		} else {
			this.parent.env.debug(...optionalData);
		}
	}).bind(this);
	log(...optionalData: any[]) {
		if (this.logs) {
			this.logs.push(optionalData);
		} else {
			this.parent.env.log(...optionalData);
		}
	}

	frame() {}
}
