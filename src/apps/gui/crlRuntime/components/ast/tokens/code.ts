import {
	OperationReference,
	operations,
	reassignmentOperators
} from "../../config.js";
import {
	AstBlockNode,
	AstCallNode,
	AstOperationNode,
	AstPropertyReadoutNode,
	removeBlanks
} from "../../definitions.js";
import AstGenerator from "../ast.js";
import { findEndOfFirstBracket, tokenise } from "../tokenise.js";
import VariableTokenAstGenerator from "./variables.js";

export default class CodeTokenAstGenerator {
	variables: VariableTokenAstGenerator;
	constructor(public generator: AstGenerator) {
		this.variables = new VariableTokenAstGenerator(generator);
	}

	generateBlockTypeAst(token: string, debug: typeof console.debug) {
		const code = token.substring(1, token.length - 1).trim();

		const obj: AstBlockNode = {
			type: "block",
			value: this.generator.generateAST(code, debug)
		};

		return obj;
	}

	generateFunctionCall(
		token: string,
		tokens: string[],
		debug: typeof console.debug
	): AstCallNode {
		debug("token", token, " is function call");

		let tkn = String(token);
		if (tkn.indexOf("(") == -1 || tkn.indexOf("(") > tkn.indexOf("{")) {
			tkn = tkn.replace("{", "() {");
			debug("Patched", token, "to", tkn);
		}

		// extract variable name
		const target = tkn.trim().textBefore("(").trim();

		debug("Target is", target, "from", tkn);

		const argsWithNoPrebracket = tkn.trim().textAfter("(").trim();
		const args = "(" + argsWithNoPrebracket;

		const endOfBrackets = findEndOfFirstBracket(args);
		const argsWithoutBrackets = args.trim().substring(1, endOfBrackets);

		const postArgs = tkn
			.substring(findEndOfFirstBracket(tkn) + 1, Infinity)
			.trim();

		const arr = [...tokenise(argsWithoutBrackets), postArgs];
		const argsTokens = removeBlanks(arr);

		const argsNodes = argsTokens.map((tkn) =>
			this.generator.generateTokenAST(tkn, debug)
		);

		const obj: AstCallNode = {
			type: "code",
			value: {
				function: this.generator.generateTokenAST(target, debug),
				type: "functionCall",
				args: argsNodes
			}
		};

		debug("Result of", token, "is", obj);

		return obj;
	}
	generateCodeAst(token: string, debug: typeof console.debug) {
		const tokens = tokenise(token, true);

		switch (tokens[0]) {
			case "let": {
				return this.variables.generateDeclaration(
					token,
					tokens,
					"newVariable",
					debug
				);
			}
			case "const": {
				return this.variables.generateDeclaration(
					token,
					tokens,
					"newConstant",
					debug
				);
			}
			case "global": {
				return this.variables.generateDeclaration(
					token,
					tokens,
					"newGlobal",
					debug
				);
			}
			default:
				const reassignmentSymbols = Object.keys(reassignmentOperators);

				if (reassignmentSymbols.includes(tokens[1])) {
					// reassignment
					return this.variables.generateReassignment(
						token,
						tokens,
						debug
					);
				} else {
					// function call
					return this.generateFunctionCall(token, tokens, debug);
				}
		}
	}

	generateOperationAst(
		token: string,
		debug: typeof console.debug
	): AstOperationNode {
		let activeToken =
			token[0] == "(" && findEndOfFirstBracket(token) == token.length - 1
				? token.substring(1, token.length - 1).trim()
				: token;

		const tokens = tokenise(activeToken, true);

		const rightHandSize = tokens.slice(2).join(" ");

		let first = this.generator.generateTokenAST(tokens[0], debug);
		let second = this.generator.generateTokenAST(rightHandSize, debug);

		const operationType: OperationReference | undefined =
			// @ts-expect-error
			operations[tokens[1]];

		if (operationType == undefined)
			throw new Error(`operation ${tokens[1]} is not valid.`);

		const obj: AstOperationNode = {
			type: "operation",
			value: {
				type: operationType,
				first: first,
				second: second
			}
		};

		return obj;
	}

	generatePropertyAst(
		token: string,
		debug: typeof console.debug
	): AstPropertyReadoutNode {
		const lastDot = token.lastIndexOf(".");
		const leftSide = token.substring(0, lastDot);
		const rightSide = token.substring(lastDot + 1, Infinity);

		const obj: AstPropertyReadoutNode = {
			type: "getProperty",
			value: {
				target: this.generator.generateTokenAST(leftSide, debug),
				propertyName: { type: "str", value: rightSide }
			}
		};

		return obj;
	}
}
