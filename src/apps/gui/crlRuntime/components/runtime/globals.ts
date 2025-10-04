import {
	RuntimeCallable,
	RuntimeFunction,
	RuntimeLazyFunction,
	RuntimeNone,
	RuntimeScope,
	RuntimeValue,
	RuntimeVariable
} from "../definitions.js";
import { CrlRuntime } from "./runtime.js";
import { Scope } from "./scope.js";
import { unwrapValue } from "./utils.js";

function none(): RuntimeNone {
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
			async (
				scopes: RuntimeScope[],
				condition: RuntimeValue, // boolean
				block: RuntimeValue // block
			): Promise<RuntimeValue> => {
				if (condition.type !== "boolean")
					throw new Error("Boolean is required.");

				if (block.type !== "block") {
					throw new Error("Cannot execute non-block.");
				}

				const bool = unwrapValue(condition, debug);

				if (bool) {
					// run it
					await this.runtime.evalBlock(
						scopes,
						unwrapValue(block, debug)
					);
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
			(
				scopes: RuntimeScope[],
				...args: RuntimeValue[]
			): RuntimeFunction => {
				const functionParameters = args.slice(0, args.length - 1);

				functionParameters.forEach((item) => {
					if (item.type !== "string") {
						throw new Error(
							"Arguement names are required to be strings."
						);
					}
				});

				const block = args.at(-1);
				if (block?.type !== "block") {
					throw new Error(
						"Block is required in function declaration."
					);
				}

				const fnc: RuntimeFunction = {
					type: "programFunction",
					isLazy: false,
					value: async (
						holdeeScope: RuntimeScope[],
						...args: RuntimeValue[]
					): Promise<RuntimeValue> => {
						const variables: Map<string, RuntimeValue> = new Map();

						for (const i in functionParameters) {
							const param = functionParameters[i];

							variables.set(unwrapValue(param, debug), args[i]);
						}

						await this.runtime.evalBlock(
							scopes,
							unwrapValue(block, debug),
							variables
						);

						// TODO: FUNCTION RETURNS

						return none();
					}
				};

				return fnc;
			}
		);
		this.newScopeFunction(
			"lazyFunction",
			(scopes: RuntimeScope[], ...args: RuntimeValue[]) => {
				const functionParameters = args.slice(0, args.length - 1);

				functionParameters.forEach((item) => {
					if (item.type !== "string") {
						throw new Error(
							"Argument names are required to be strings."
						);
					}
				});

				const block = args.at(-1);
				if (block?.type !== "block") {
					throw new Error(
						"Block is required in function declaration."
					);
				}

				const lazyFunction: RuntimeLazyFunction = {
					type: "programFunction",
					isLazy: true,
					value: async (
						holdeeScope: RuntimeScope[],
						...args: RuntimeValue[]
					): Promise<RuntimeValue> => {
						args.forEach((item) => {
							if (item.type !== "lazyValue") {
								throw new Error(
									"Lazy functions only accept lazy value parameters. this is likely a runtime error."
								);
							}
						});

						const variables: Map<string, RuntimeValue> = new Map();

						for (const i in functionParameters) {
							const param = functionParameters[i];
							const arg = args[i];

							if (arg == undefined) {
								debug(
									"Parameter",
									param,
									"was not provided by caller."
								);
								throw new Error(
									"Parameter was not provided by caller."
								);
							}

							variables.set(unwrapValue(param, debug), arg);
						}

						// consider function for reloading the value
						debug("Creating evaluate function");
						const evaluator: RuntimeFunction = {
							type: "programFunction",
							isLazy: false,
							value: async (
								holdeeScopes: RuntimeScope[],
								name: RuntimeValue
							) => {
								if (name?.type !== "lazyValue") {
									throw new Error(
										"Evaluate requires a lazyValue"
									);
								}

								return await this.runtime.evalNode(
									name.value.scopes,
									name.value.value
								);
							}
						};

						debug(
							"Attaching evaluator function",
							evaluator,
							"to",
							variables
						);
						variables.set("consider", evaluator);

						await this.runtime.evalBlock(
							scopes,
							unwrapValue(block, debug),
							variables
						);

						// TODO: FUNCTION RETURNS

						return none();
					}
				};

				return lazyFunction;
			}
		);

		this.newScopeFunction("include", (scopes: RuntimeScope[]) => {
			/**
			 * Hello!
			 * this function is never called.
			 * See the implementation of code within `CrlRuntime.evalCode` for the case of a function call - import is overwritten there.
			 * Happy coding!
			 */

			// shut up typescript.
			return none();
		});

		const While: RuntimeCallable = async (
			scopes: RuntimeScope[],
			condition: RuntimeValue,
			block: RuntimeValue
		) => {
			if (condition?.type !== "lazyValue")
				throw new Error(
					"Lazy function has not recieved lazy value for condition (while)"
				);
			if (block?.type !== "lazyValue")
				throw new Error(
					"Lazy function has not recieved lazy value for block (while)"
				);

			const getCondition = async () => {
				return await this.runtime.evalNode(
					condition.value.scopes,
					condition.value.value
				);
			};

			const blockNode = await this.runtime.evalNode(
				block.value.scopes,
				block.value.value
			);
			if (blockNode.type !== "block") {
				throw new Error(
					"While requires a block as the second parameter."
				);
			}

			let go = await getCondition();
			while (go) {
				await this.runtime.evalBlock(
					block.value.scopes,
					unwrapValue(blockNode, debug)
				);
			}

			return none();
		};

		this.newScopeFunction("while", While, true);
	}
}
