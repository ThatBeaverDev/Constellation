import { OperationReference } from "../../config.js";
import {
	AstCallNode,
	AstOperationNode,
	AstPropertyReadoutNode,
	AstVariableNode,
	RuntimeNone,
	RuntimeScope,
	RuntimeValue,
	RuntimeVariable
} from "../../definitions.js";
import { CrlRuntime } from "../runtime.js";
import { DynamicScope } from "../scopes/DynamicScope.js";
import { makeValueLazy, unwrapValue } from "../utils.js";

export default class CodeRuntimeEvaluator {
	debug: typeof console.debug;
	constructor(public runtime: CrlRuntime) {
		this.debug = runtime.debug;
	}

	async evalProperty(scopes: RuntimeScope[], node: AstPropertyReadoutNode) {
		const target = await this.runtime.evalNode(scopes, node.value.target);

		const propertyNode = await this.runtime.evalNode(
			scopes,
			node.value.propertyName
		);
		const propertyName = unwrapValue(propertyNode, this.debug);

		if (target.type !== "dict") {
			throw new Error(
				`Properties of primitives cannot be read. (reading ${node.value.target.value}.${propertyName})`
			);
		}

		const returnValue = target.value.get(propertyName);

		if (returnValue == undefined) {
			this.debug(target, "lacks property", propertyNode);
			throw new Error(
				`Property ${propertyNode} doesn't exist on ${JSON.stringify(target)}`
			);
		}

		return returnValue;
	}

	async evalOperation(scopes: RuntimeScope[], node: AstOperationNode) {
		if (node.value.first == undefined)
			throw new Error("First operation node is undefined.");
		if (node.value.second == undefined)
			throw new Error("Second operation node is undefined.");

		this.debug("Evaluate first argument token", node.value.first);
		const firstRuntimeValue = await this.runtime.evalNode(
			scopes,
			node.value.first
		);
		this.debug("Unwrap first argument token", firstRuntimeValue);
		const first = unwrapValue(firstRuntimeValue, this.debug);

		// second token
		this.debug("Evaluate second argument token", node.value.second);
		const secondRuntimeValue = await this.runtime.evalNode(
			scopes,
			node.value.second
		);
		this.debug("Unwrap second argument token", secondRuntimeValue);
		const second = unwrapValue(secondRuntimeValue, this.debug);

		// handling
		let result: number | boolean;
		const operationType: OperationReference = node.value.type;

		switch (operationType) {
			case "addition":
				result = first + second;
				break;
			case "and":
				result = first && second;
				break;
			case "division":
				result = first / second;
				break;
			case "exponent":
				result = first ** second;
				break;
			case "greaterThan":
				result = first > second;
				break;
			case "greaterThanOrEqual":
				result = first >= second;
				break;
			case "isEqual":
				result = first == second;
				break;
			case "isNotEqual":
				result = first != second;
				break;
			case "lessThan":
				result = first < second;
				break;
			case "lessThanOrEqual":
				result = first <= second;
				break;
			case "multiplication":
				result = first * second;
				break;
			case "or":
				result = first || second;
				break;
			case "remainder":
				result = first % second;
				break;
			case "subtraction":
				result = first - second;
				break;
			default:
				const exhaustiveCheck: never = operationType;
				exhaustiveCheck;
				throw new Error("Unknown operation type: " + operationType);
		}

		if (result == undefined) {
			throw new Error(
				"Operation has yielded undefined: " + JSON.stringify(node)
			);
		}

		let obj: RuntimeValue;
		switch (typeof result) {
			case "string":
				obj = {
					type: "string",
					value: result
				};
				break;
			case "number":
				obj = {
					type: "number",
					value: result
				};
				break;
			case "boolean":
				obj = {
					type: "boolean",
					value: result
				};
				break;
			default:
				const exhaustiveCheck: never = result;
				exhaustiveCheck;
				throw new Error(
					"Type " +
						typeof result +
						" is wrappable by operation handling."
				);
		}

		return obj;
	}

	async evalCode(
		scopes: RuntimeScope[],
		node: AstCallNode
	): Promise<RuntimeValue> {
		const data = node.value;
		const type = data.type;

		function none(): RuntimeNone {
			return { type: "none", value: null };
		}

		const holdingScope = scopes.at(-1);
		if (holdingScope == undefined)
			throw new Error("No scopes are present!");

		switch (type) {
			case "newVariable": {
				if (holdingScope.variables.get(data.name) !== undefined)
					throw new Error(
						`Variable ${data.name} is already defined in this scope!`
					);

				const value = await this.runtime.evalNode(scopes, data.value);
				const variable: RuntimeVariable = { type: "variable", value };

				holdingScope.variables.set(data.name, variable);

				break;
			}
			case "newConstant": {
				if (holdingScope.variables.get(data.name) !== undefined)
					throw new Error(
						`Variable ${data.name} is already defined in this scope!`
					);

				const value = await this.runtime.evalNode(scopes, data.value);
				const constant: RuntimeVariable = {
					type: "constant",
					value
				};

				holdingScope.variables.set(data.name, constant);
				break;
			}

			case "newGlobal": {
				const globalScope = this.runtime.globalScope;

				if (globalScope.variables.get(data.name) !== undefined)
					throw new Error(
						`Variable ${data.name} is already defined in this scope!`
					);

				const value = await this.runtime.evalNode(scopes, data.value);
				const variable: RuntimeVariable = {
					type: "global",
					value
				};

				globalScope.variables.set(data.name, variable);
				break;
			}

			case "reassignment": {
				// eval the node
				const value = await this.runtime.evalNode(scopes, data.value);

				// assign
				this.runtime.reassignVariableInScopes(scopes, data.name, value);
				break;
			}

			case "functionCall": {
				this.runtime.debug(
					"Deploy function",
					data.function,
					"scoped with",
					scopes
				);

				const callee = await this.runtime.evalNode(
					scopes,
					data.function
				);

				let result: RuntimeValue;

				if (callee.type !== "programFunction")
					throw new Error("This is not a function!");

				if (callee.isLazy) {
					// lazy
					const args = await Promise.all(
						data.args.map((item) => makeValueLazy(scopes, item))
					);

					result = await callee.value(scopes, ...args);
				} else {
					const args = await Promise.all(
						data.args.map(
							async (item) =>
								await this.runtime.evalNode(scopes, item)
						)
					);

					// extra case for include
					if (
						callee ==
						this.runtime.globalScope.variables.get("include")?.value
					) {
						// this is an import statement. it acts differently
						await this.handleImport(
							scopes,
							{ type: "none", value: null },
							args[0]
						);

						return none();
					}

					result = await callee.value(scopes, ...args);
				}

				return result;
			}

			default:
				throw new Error("Unknown executable code bit type: " + type);
		}

		return none();
	}

	evalVariable(scopes: RuntimeScope[], node: AstVariableNode) {
		const variable = this.runtime.readVariableFromScopes(
			scopes,
			node.value
		);

		return variable.value;
	}

	async handleImport(
		scopes: RuntimeScope[],
		importingFile: RuntimeValue,
		importTarget: RuntimeValue
	) {
		if (importTarget.type !== "string")
			throw new Error("Import target must be of type string.");

		// TODO: ALLOW IMPORT FROM FILES

		const target = unwrapValue(importTarget, this.debug);
		const hostFS = this.runtime.app.env.fs;

		// get the path
		const coreLibraryPath = hostFS.resolve(
			this.runtime.app.directory,
			`./components/runtime/corelib/${target}.js`
		);

		// get the library
		const exportee = await this.runtime.app.env.include(coreLibraryPath);
		const lib = exportee.default as typeof DynamicScope;

		// create it
		const libraryInstance = new lib(this.runtime, this.runtime.isDebug);

		// done
		scopes.push(libraryInstance);
	}
}
