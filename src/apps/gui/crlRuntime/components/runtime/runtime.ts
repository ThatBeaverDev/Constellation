import CrlRunner from "../../tcpsys/app.js";
import CrlInstance from "../crl.js";
import {
	RuntimeBlock,
	RuntimeNone,
	RuntimeScope,
	RuntimeValue,
	RuntimeVariable
} from "../definitions.js";
import { AstNode } from "../definitions.js";
import BasicsRuntimeEvaluator from "./evaluation/basics.js";
import CodeRuntimeEvaluator from "./evaluation/code.js";
import ObjectsRuntimeEvaluator from "./evaluation/objects.js";
import { GlobalScope } from "./scopes/GlobalScope.js";
import { Scope } from "./scopes/scope.js";

export class CrlRuntime {
	ast: AstNode[];
	app: CrlRunner;
	debug: typeof console.debug;

	basics: BasicsRuntimeEvaluator;
	objects: ObjectsRuntimeEvaluator;
	code: CodeRuntimeEvaluator;

	constructor(
		ast: AstNode[],
		public parent: CrlInstance,
		public isDebug: boolean = false
	) {
		this.debug = isDebug ? this.parent.debug : (...args: any[]) => {};

		this.basics = new BasicsRuntimeEvaluator(this);
		this.objects = new ObjectsRuntimeEvaluator(this);
		this.code = new CodeRuntimeEvaluator(this);

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

		this.debug(
			"Variable by name " + name + " is not declared within scopes,",
			scopes
		);
		throw new Error("Variable by name " + name + " is not declared.");
	}
	reassignVariableInScopes(
		scopes: RuntimeScope[],
		name: string,
		value: RuntimeValue
	) {
		for (const scope of scopes) {
			let val = scope.variables.get(name);

			if (val == undefined) {
				this.debug("Scope", scope.variables, `doesn't have ${name}`);
			} else {
				this.debug(
					"Scope",
					scope.variables,
					`has ${name}. reassigning.`
				);

				val.value = value;
				scope.variables.set(name, val);

				return;
			}
		}

		this.debug(
			"Variable by name " + name + " is not declared within scopes,",
			scopes
		);
		throw new Error("Variable by name " + name + " is not declared.");
	}

	async evalBlock(
		scopes: RuntimeScope[],
		block: AstNode[],
		variables?: Map<string, RuntimeValue>
	) {
		let extendedScopes = [...scopes];

		// function parameter scope
		if (variables) {
			// create scope
			const variableScope = new Scope(this, this.isDebug);
			extendedScopes = [...extendedScopes, variableScope];

			const variableList = variables.keys();
			this.debug(
				"Evaluation of block has local variables passed.",
				variableList,
				variables
			);

			// assign variables
			for (const variableName of variables.keys()) {
				this.debug(
					`Attaching variable ${variableName} to scope,`,
					variableScope
				);

				const variableValue = variables.get(variableName);
				if (!variableValue)
					throw new Error(
						"Argument passed in function call went missing."
					);

				variableScope.variables.set(variableName, {
					type: "constant",
					value: variableValue
				});
			}
		}

		// new variables scope
		const extendingScope = new Scope(this, this.isDebug);
		extendedScopes = [...extendedScopes, extendingScope];

		this.debug("Running block with scopes", extendedScopes);

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
				return this.basics.evalString(scopes, node);
			}
			case "num": {
				return this.basics.evalNumber(scopes, node);
			}

			case "bool": {
				return this.basics.evalBoolean(scopes, node);
			}

			case "list": {
				return await this.objects.evalList(scopes, node);
			}

			case "dict": {
				return await this.objects.evalDict(scopes, node);
			}

			case "getProperty": {
				return await this.code.evalProperty(scopes, node);
			}

			case "operation": {
				return await this.code.evalOperation(scopes, node);
			}

			case "code": {
				return await this.code.evalCode(scopes, node);
			}

			case "var": {
				return this.code.evalVariable(scopes, node);
			}

			default:
				throw new Error(
					`Runtime error: AstNode type ${node.type} is not recognised.`
				);
		}

		return none();
	}
}
