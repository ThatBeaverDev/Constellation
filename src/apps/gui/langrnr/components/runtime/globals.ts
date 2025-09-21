import {
	AstNode,
	RuntimeBoolean,
	RuntimeFunction,
	RuntimeNone,
	RuntimeValue,
	RuntimeVariable
} from "../definitions.js";
import { LanguageRuntime } from "./runtime.js";
import { Scope } from "./scope.js";
import { unwrapValue } from "./utils.js";

function none(): RuntimeNone {
	return { type: "none", value: undefined };
}

// default global scope
export class GlobalScope extends Scope {
	#runtime: LanguageRuntime;
	constructor(runtime: LanguageRuntime) {
		super();
		this.#runtime = runtime;

		const println: RuntimeVariable<RuntimeFunction> = {
			type: "global",
			value: {
				type: "programFunction",
				value: function (
					scopes: Scope[],
					block: AstNode[],
					first: any,
					...otherParams: any[]
				): RuntimeValue {
					const arr = [first, ...otherParams].map((item) =>
						unwrapValue(item)
					);

					console.log(...arr);

					return none();
				}
			}
		};
		this.variables.set("println", println);

		const ifFunc = (
			scopes: Scope[],
			block: AstNode[],
			condition: RuntimeBoolean
		): RuntimeValue => {
			if (condition) {
				const extendingScope = new Scope();

				// run it
				this.#runtime.evalBlock([...scopes, extendingScope], block);
			}

			return none();
		};

		const ifObj: RuntimeVariable<RuntimeFunction> = {
			type: "global",
			value: {
				type: "programFunction",
				value: ifFunc
			}
		};
		this.variables.set("if", ifObj);
	}
}

// builtin libraries
export const ui = {};
