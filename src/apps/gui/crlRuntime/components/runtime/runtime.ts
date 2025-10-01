import CrlRunner from "../../tcpsys/app.js";
import { OperationReference } from "../config.js";
import CrlRunnerInstance from "../core/core.js";
import {
	AstCallNode,
	RuntimeBlock,
	RuntimeBoolean,
	RuntimeDict,
	RuntimeFunction,
	RuntimeList,
	RuntimeNone,
	RuntimeNumber,
	RuntimeScope,
	RuntimeString,
	RuntimeValue,
	RuntimeVariable
} from "../definitions.js";
import { AstNode } from "../definitions.js";
import { DynamicScope, GlobalScope } from "./globals.js";
import { Scope } from "./scope.js";
import { unwrapValue } from "./utils.js";

export function runBlock(scope: any, block: AstNode[]) {}

export class CrlRuntime {
	ast: AstNode[];
	app: CrlRunner;
	debug: typeof console.debug;
	constructor(
		ast: AstNode[],
		public parent: CrlRunnerInstance,
		public isDebug: boolean = false
	) {
		this.debug = isDebug ? this.parent.debug : (...args: any[]) => {};

		this.globalScope = new GlobalScope(this, isDebug);
		this.app = parent.parent;
		this.ast = ast;

		// start the script
		const scopes = [this.globalScope, ...this.loadedLibraries];
		this.debug("Starting execution of init with scopes", scopes);
		this.evalBlock(scopes, this.ast);
	}

	globalScope: GlobalScope;
	loadedLibraries: Scope[] = [];

	readVariableFromScopes(
		scopes: RuntimeScope[],
		name: string
	): RuntimeVariable {
		for (const scope of scopes) {
			let val = scope.variables.get(name);

			if (val == undefined) {
				this.debug("Scope", scope.variables, `doesn't have ${name}`);
			} else {
				this.debug("Scope", scope.variables, `has ${name}`);
				return val;
			}
		}

		throw new Error("Variable by name " + name + " is not declared.");
	}

	async evalBlock(scopes: RuntimeScope[], block: AstNode[]) {
		const extendingScope = new Scope(this, this.isDebug);
		const extendedScopes = [...scopes, extendingScope];

		for (const node of block) {
			await this.evalNode(extendedScopes, node);
		}
	}

	async evalNode(
		scopes: RuntimeScope[],
		node: AstNode
	): Promise<RuntimeValue> {
		function none(): RuntimeNone {
			return { type: "none", value: null };
		}

		this.debug("Evaluating node", node);

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

			case "list": {
				const obj: RuntimeList = {
					type: "list",
					value: await Promise.all(
						node.value.map(
							async (item) => await this.evalNode(scopes, item)
						)
					)
				};

				return obj;
			}

			case "dict": {
				const astMapping = node.value;
				const runtimeMapping: Map<RuntimeValue, RuntimeValue> =
					new Map();

				for (const [key, value] of astMapping) {
					const runtimeKey = await this.evalNode(scopes, key);
					const runtimeValue = await this.evalNode(scopes, value);

					runtimeMapping.set(
						unwrapValue(runtimeKey, this.debug),
						runtimeValue
					);
				}

				const obj: RuntimeDict = {
					type: "dict",
					value: runtimeMapping
				};

				return obj;
			}

			case "getProperty":
				const target = await this.evalNode(scopes, node.value.target);

				if (target.type !== "dict") {
					throw new Error("Properties of non-dicts cannot be read.");
				}

				const propertyName = await this.evalNode(
					scopes,
					node.value.propertyName
				);

				const returnValue = target.value.get(
					unwrapValue(propertyName, this.debug)
				);

				if (returnValue == undefined) {
					this.debug(target, "lacks property", propertyName);
					throw new Error(
						`Property ${JSON.stringify(propertyName)} doesn't exist on ${JSON.stringify(target)}`
					);
				}

				return returnValue;

			case "operation": {
				if (node.value.first == undefined)
					throw new Error("First operation node is undefined.");
				if (node.value.second == undefined)
					throw new Error("Second operation node is undefined.");

				this.debug("Evaluate first argument token", node.value.first);
				const firstRuntimeValue = await this.evalNode(
					scopes,
					node.value.first
				);
				this.debug("Unwrap first argument token", firstRuntimeValue);
				const first = unwrapValue(firstRuntimeValue, this.debug);

				// second token
				this.debug("Evaluate second argument token", node.value.second);
				const secondRuntimeValue = await this.evalNode(
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
						throw new Error(
							"Unknown operation type: " + operationType
						);
				}

				if (result == undefined) {
					throw new Error(
						"Operation has yielded undefined: " +
							JSON.stringify(node)
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

			case "code": {
				if (node.type !== "code") break;

				const obj: RuntimeValue = await this.evalCode(
					scopes,
					node as AstCallNode
				);

				return obj;
			}

			case "var": {
				const variable = this.readVariableFromScopes(
					scopes,
					node.value
				);

				return variable.value;
			}

			default:
				throw new Error(
					`Runtime error: AstNode type ${node.type} is not recognised.`
				);
		}

		return none();
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

				const value = await this.evalNode(scopes, data.value);
				const variable: RuntimeVariable = { type: "variable", value };

				holdingScope.variables.set(data.name, variable);

				break;
			}
			case "newConstant": {
				if (holdingScope.variables.get(data.name) !== undefined)
					throw new Error(
						`Variable ${data.name} is already defined in this scope!`
					);

				const value = await this.evalNode(scopes, data.value);
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

				const value = await this.evalNode(scopes, data.value);
				const variable: RuntimeVariable = {
					type: "global",
					value
				};

				globalScope.variables.set(data.name, variable);
				break;
			}

			case "functionCall": {
				if (this.isDebug)
					this.parent.debug(
						"Deploy function",
						data.function,
						"scoped with",
						scopes
					);

				const callee = (await this.evalNode(
					scopes,
					data.function
				)) as RuntimeFunction;

				const args = await Promise.all(
					data.args.map((item) => this.evalNode(scopes, item))
				);

				if (
					callee == this.globalScope.variables.get("include")?.value
				) {
					// this is an import statement. it acts differently
					await this.handleImport(
						scopes,
						{ type: "none", value: null },
						args[0]
					);

					return none();
				}

				let result: RuntimeValue;
				if (callee.type !== "programFunction")
					throw new Error("This is not a function!");

				if (typeof callee.value == "function") {
					result = await callee.value(scopes, ...args);
				} else {
					// TODO: Make a new scope
					await this.evalBlock(scopes, callee.value);

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

	async handleImport(
		scopes: RuntimeScope[],
		importingFile: RuntimeValue,
		importTarget: RuntimeValue
	) {
		if (importTarget.type !== "string")
			throw new Error("Import target must be of type string.");

		// TODO: ALLOW IMPORT FROM FILES

		const target = unwrapValue(importTarget, this.debug);
		const hostFS = this.app.env.fs;

		// get the path
		const coreLibraryPath = hostFS.resolve(
			this.app.directory,
			`./components/runtime/corelib/${target}.js`
		);

		// get the library
		const exportee = await this.app.env.include(coreLibraryPath);
		const lib = exportee.default as typeof DynamicScope;

		// create it
		const libraryInstance = new lib(this, this.isDebug);

		// done
		scopes.push(libraryInstance);
	}
}
