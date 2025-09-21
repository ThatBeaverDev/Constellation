import {
	AstNode,
	AstStringNode,
	AstBooleanNode,
	AstNumberNode,
	AstVariableNode,
	AstCallNode,
	removeBlanks
} from "../definitions.js";
import { tokenise } from "./tokenise.js";
import { getTokenType } from "./types.js";

function tokenToNumber(token: string) {
	switch (token) {
		case "infinity":
			return Infinity;
	}

	return Number(token);
}

export function generateTokenAST(token: string): AstNode {
	const type = getTokenType(token);

	switch (type) {
		case "str": {
			const obj: AstStringNode = {
				type: "str",
				value: token.substring(1, token.length - 1)
			};

			return obj;
		}
		case "num": {
			const obj: AstNumberNode = {
				type: "num",
				value: tokenToNumber(token)
			};

			return obj;
		}
		case "bool": {
			const obj: AstBooleanNode = {
				type: "bool",
				value: token == "true"
			};

			return obj;
		}

		case "var": {
			const obj: AstVariableNode = {
				type: "var",
				value: String(token)
			};

			return obj;
		}
		case "code": {
			const tokens = tokenise(token, true);

			switch (tokens[0]) {
				case "let": {
					if (tokens[2] !== "=") {
						throw new Error(
							`(${tokens[2]} is not valid during variable declaration`
						);
					}

					const obj: AstCallNode = {
						type: "code",
						value: {
							type: "newVariable",
							name: tokens[1],
							value: generateTokenAST(tokens[3])
						}
					};

					return obj;
				}
				case "const": {
					if (tokens[2] !== "=") {
						throw new Error(
							`(${tokens[2]} is not valid during variable declaration`
						);
					}

					const obj: AstCallNode = {
						type: "code",
						value: {
							type: "newConstant",
							name: tokens[1],
							value: generateTokenAST(tokens[3])
						}
					};

					return obj;
				}
				case "global": {
					if (tokens[2] !== "=") {
						throw new Error(
							`(${tokens[2]} is not valid during variable declaration`
						);
					}

					const obj: AstCallNode = {
						type: "code",
						value: {
							type: "newGlobal",
							name: tokens[1],
							value: generateTokenAST(tokens[3])
						}
					};

					return obj;
				}
				default:
					const target = token.trim().textBefore("(").trim();
					const args = token.trim().textAfter("(").trim();
					const argsWithoutBrackets = args
						.trim()
						.substring(0, args.length - 1);

					const argsTokens = removeBlanks(
						tokenise(argsWithoutBrackets)
					);

					const argsNodes = argsTokens.map((token) =>
						generateTokenAST(token)
					);

					const obj: AstCallNode = {
						type: "code",
						value: {
							function: generateTokenAST(target),
							type: "functionCall",
							args: argsNodes
						}
					};

					return obj;
			}
		}
	}

	throw new Error("Type '" + type + "' was not handled in token generation.");
}
