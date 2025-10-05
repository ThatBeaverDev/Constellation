import {
	AstBooleanNode,
	AstNumberNode,
	AstStringNode,
	RuntimeBoolean,
	RuntimeNumber,
	RuntimeScope,
	RuntimeString
} from "../../definitions.js";
import { CrlRuntime } from "../runtime.js";

export default class BasicsRuntimeEvaluator {
	debug: typeof console.debug;
	constructor(public runtime: CrlRuntime) {
		this.debug = runtime.debug;
	}

	evalString(scopes: RuntimeScope[], node: AstStringNode) {
		const obj: RuntimeString = {
			type: "string",
			value: node.value
		};
		return obj;
	}
	evalNumber(scopes: RuntimeScope[], node: AstNumberNode) {
		const obj: RuntimeNumber = {
			type: "number",
			value: node.value
		};

		return obj;
	}

	evalBoolean(scopes: RuntimeScope[], node: AstBooleanNode) {
		const obj: RuntimeBoolean = {
			type: "boolean",
			value: node.value
		};

		return obj;
	}
}
