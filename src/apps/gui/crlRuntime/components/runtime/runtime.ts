import CrlRunner from "../../tcpsys/app.js";
import CrlRunnerInstance from "../core/core.js";
import {
	AstCallNode,
	RuntimeBlock,
	RuntimeBoolean,
	RuntimeFunction,
	RuntimeNone,
	RuntimeNumber,
	RuntimeScope,
	RuntimeString,
	RuntimeValue,
	RuntimeVariable
} from "../definitions.js";
import { AstNode } from "../definitions.js";
import { GlobalScope } from "./globals.js";
import { unwrapValue } from "./utils.js";

export function runBlock(scope: any, block: AstNode[]) {}

export class CrlRuntime {
	ast: AstNode[];
	app: CrlRunner;
	constructor(
		ast: AstNode[],
		public parent: CrlRunnerInstance
	) {
		this.globalScope = new GlobalScope(this);
		this.app = parent.parent;
		this.ast = ast;

		// start the script
		this.evalBlock([this.globalScope], this.ast);
	}

	globalScope: GlobalScope;

	readVariableFromScopes(scopes: RuntimeScope[], name: string) {
		let variable: RuntimeVariable | undefined = undefined;

		for (const scope of scopes) {
			let val = scope.variables.get(name);

			if (val !== undefined) {
				variable = val;
				break;
			}
		}

		if (typeof variable == "undefined")
			throw new Error("Variable by name " + name + " is not declared.");

		return variable;
	}

	evalBlock(scopes: RuntimeScope[], block: AstNode[]) {
		for (const node of block) {
			this.evalNode(scopes, node);
		}
	}

	evalNode(scopes: RuntimeScope[], node: AstNode): RuntimeValue {
		function none(): RuntimeNone {
			return { type: "none", value: undefined };
		}

		switch (node.type) {
			case "block":
				const obj: RuntimeBlock = {
					type: "block",
					value: node.value
				};

				return obj;

			case "str": {
				const obj: RuntimeString = {
					type: "string",
					value: node.value
				};
				return obj;
			}
			case "num": {
				const obj: RuntimeNumber = {
					type: "number",
					value: node.value
				};

				return obj;
			}

			case "bool": {
				const obj: RuntimeBoolean = {
					type: "boolean",
					value: node.value
				};

				return obj;
			}

			case "conditional": {
				const first = unwrapValue(
					this.evalNode(scopes, node.value.first)
				);
				const second = unwrapValue(
					this.evalNode(scopes, node.value.second)
				);

				let result: boolean;
				const conditionalType = node.value.type;

				switch (conditionalType) {
					case "isEqual":
						result = first == second;
						break;
					case "greaterThan":
						result = first > second;
						break;
					case "lessThan":
						result = first < second;
						break;
					default:
						throw new Error(
							"Unknown conditional type: " + conditionalType
						);
				}

				const obj: RuntimeBoolean = {
					type: "boolean",
					value: result
				};

				return obj;
			}

			case "code": {
				if (node.type !== "code") break;

				const obj: RuntimeValue = this.evalCode(
					scopes,
					node as AstCallNode
				);

				return obj;
			}

			case "var": {
				return this.readVariableFromScopes(scopes, node.value).value;
			}

			default:
				throw new Error(
					`Runtime error: AstNode type ${node.type} is not recognised.`
				);
		}

		return none();
	}

	evalCode(scopes: RuntimeScope[], node: AstCallNode): RuntimeValue {
		const data = node.value;
		const type = data.type;

		function none(): RuntimeNone {
			return { type: "none", value: undefined };
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

				const value = this.evalNode(scopes, data.value);
				const variable: RuntimeVariable = { type: "variable", value };

				holdingScope.variables.set(data.name, variable);

				break;
			}
			case "newConstant": {
				if (holdingScope.variables.get(data.name) !== undefined)
					throw new Error(
						`Variable ${data.name} is already defined in this scope!`
					);

				const value = this.evalNode(scopes, data.value);
				const constant: RuntimeVariable = {
					type: "constant",
					value
				};

				holdingScope.variables.set(data.name, constant);
				break;
			}

			case "newGlobal": {
				const globalScope = this.globalScope;

				if (globalScope.variables.get(data.name) !== undefined)
					throw new Error(
						`Variable ${data.name} is already defined in this scope!`
					);

				const value = this.evalNode(scopes, data.value);
				const variable: RuntimeVariable = {
					type: "global",
					value
				};

				globalScope.variables.set(data.name, variable);
				break;
			}

			case "functionCall": {
				const callee = this.evalNode(
					scopes,
					data.function
				) as RuntimeFunction;

				const args = data.args.map((item) =>
					this.evalNode(scopes, item)
				);

				let result: RuntimeValue;
				if (callee.type !== "programFunction")
					throw new Error("This is not a function!");

				if (typeof callee.value == "function") {
					result = callee.value(scopes, ...args);
				} else {
					// TODO: Make a new scope
					this.evalBlock(scopes, callee.value);

					// TODO: return value!
					result = none();
				}

				return result;
			}

			default:
				throw new Error("Unknown executable code bit type: " + type);
		}

		return none();
	}
}
