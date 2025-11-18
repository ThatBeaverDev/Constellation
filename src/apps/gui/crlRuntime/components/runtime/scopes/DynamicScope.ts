import {
	RuntimeCallable,
	RuntimeFunction,
	RuntimeLazyFunction,
	RuntimeNone,
	RuntimeScope,
	RuntimeValue,
	RuntimeVariable
} from "../../definitions.js";
import { CrlRuntime } from "../runtime.js";
import { Scope } from "./scope.js";

export function none(): RuntimeNone {
	return { type: "none", value: null };
}

export class DynamicScope extends Scope {
	constructor(
		runtime: CrlRuntime,
		public isDebug: boolean = false
	) {
		super(runtime, isDebug);
	}

	newScopeFunction(
		name: string,
		func: RuntimeCallable,
		isLazy: boolean = false
	) {
		let fnc = func.bind(this);

		if (this.isDebug)
			fnc = ((scope: RuntimeScope[], ...args: RuntimeValue[]) => {
				this.runtime.parent.debug("functionCall of", name, "recieved.");

				return func.bind(this)(scope, ...args);
			}).bind(this);

		const variable: RuntimeVariable<RuntimeFunction | RuntimeLazyFunction> =
			{
				type: "global",
				value: {
					type: "programFunction",
					isLazy: isLazy,
					value: fnc
				}
			};

		this.variables.set(name, variable);
	}
}
