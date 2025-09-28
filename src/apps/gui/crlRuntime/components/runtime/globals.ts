import {
	RuntimeCallable,
	RuntimeFunction,
	RuntimeNone,
	RuntimeScope,
	RuntimeValue,
	RuntimeVariable
} from "../definitions.js";
import { CrlRuntime } from "./runtime.js";
import { Scope } from "./scope.js";
import { unwrapValue } from "./utils.js";

function none(): RuntimeNone {
	return { type: "none", value: undefined };
}

export class DynamicScope extends Scope {
	constructor(
		runtime: CrlRuntime,
		public isDebug: boolean = false
	) {
		super(runtime, isDebug);
	}

	newScopeFunction(name: string, func: RuntimeCallable) {
		let fnc = func.bind(this);

		if (this.isDebug)
			fnc = ((scope: RuntimeScope[], ...args: RuntimeValue[]) => {
				this.runtime.parent.debug("functionCall of", name, "recieved.");

				return func.bind(this)(scope, ...args);
			}).bind(this);

		const variable: RuntimeVariable<RuntimeFunction> = {
			type: "global",
			value: {
				type: "programFunction",
				value: fnc
			}
		};

		this.variables.set(name, variable);
	}
}

// default global scope
export class GlobalScope extends DynamicScope {
	constructor(
		runtime: CrlRuntime,
		public isDebug: boolean = false
	) {
		super(runtime);

		const debug = isDebug
			? this.runtime.parent.debug
			: (...args: any[]) => {};

		// logging
		this.newScopeFunction(
			"println",
			(
				scopes: RuntimeScope[],
				first: any,
				...otherParams: any[]
			): RuntimeValue => {
				const arr = [first, ...otherParams].map((item) =>
					unwrapValue(item, debug)
				);

				this.runtime.parent.log(...arr);

				return none();
			}
		);

		// program flow
		this.newScopeFunction(
			"if",
			(
				scopes: RuntimeScope[],
				condition: RuntimeValue, // boolean
				block: RuntimeValue // block
			): RuntimeValue => {
				if (condition.type !== "boolean")
					throw new Error("Boolean is required.");

				if (block.type !== "block") {
					throw new Error("Cannot execute non-block.");
				}

				const bool = unwrapValue(condition, debug);

				if (bool) {
					// run it
					this.runtime.evalBlock(scopes, unwrapValue(block, debug));
				}

				return none();
			}
		);

		// technically an operator but I'm making it a function
		this.newScopeFunction(
			"not",
			(
				scopes: RuntimeScope[],
				condition: RuntimeValue /* boolean */
			): RuntimeValue => {
				if (condition.type !== "boolean")
					throw new Error("Boolean is required.");

				const value = unwrapValue(condition, debug);

				return { type: "boolean", value: value == false };
			}
		);

		// function declarations
		this.newScopeFunction(
			"function",
			(scopes: RuntimeScope[], block: RuntimeValue): RuntimeFunction => {
				if (block?.type !== "block") {
					throw new Error(
						"Block is required in function declaration."
					);
				}

				const fnc: RuntimeFunction = {
					type: "programFunction",
					value: (scopes: RuntimeScope[]): RuntimeValue => {
						this.runtime.evalBlock(
							scopes,
							unwrapValue(block, debug)
						);

						// TODO: FUNCTION RETURNS

						return { type: "none", value: undefined };
					}
				};

				return fnc;
			}
		);
	}
}
