import { OperationReference, operations } from "../config.js";
import {
	AstBlockNode,
	AstBooleanNode,
	AstCallNode,
	AstOperationNode,
	AstListNode,
	AstNode,
	AstNumberNode,
	AstStringNode,
	AstVariableNode,
	removeBlanks
} from "../definitions.js";
import {
	findEndOfFirstBracket,
	tokenBasedSplit,
	tokenise
} from "./tokenise.js";
import { getTokenType } from "./types.js";

export function generateAST(code: string) {
	const lines = removeBlanks(
		tokenBasedSplit(code, ";").map((line) => removeComments(line))
	);

	const ast = [];
	for (const line of lines) {
		ast.push(generateLineAST(line));
	}

	return ast;
}

export function removeComments(code: string) {
	const lines = code.split("\n");

	const noComments = lines.map((line) => removeCommentsOnLine(line));

	return noComments.join("\n");
}

function removeCommentsOnLine(line: string) {
	let quotes: '"' | "'" | "`" | "" = "";

	const chars = line.split("");

	let staging = "";
	let lastChar: string = "";
	for (const char of chars) {
		function push() {
			staging += char;
		}

		switch (char) {
			// quotes
			case '"':
			case "'":
			case "`":
				if (quotes == char) {
					quotes = "";
				} else {
					if (quotes == "") {
						quotes = char;
					}
				}

				push();
				break;

			case "/":
				if (quotes !== "") {
					push();
					break;
				}

				if (lastChar == "/") {
					// staging will include a / on the end so we remove it
					return staging.substring(0, staging.length - 1).trim();
				}

				push();
				break;

			default:
				push();
		}

		lastChar = char;
	}

	return staging;
}

function generateLineAST(line: string) {
	return generateTokenAST(line);
}

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

		case "operation": {
			let activeToken =
				token[0] == "(" &&
				findEndOfFirstBracket(token) == token.length - 1
					? token.substring(1, token.length - 1).trim()
					: token;

			const tokens = tokenise(activeToken, true);

			const rightHandSize = tokens.slice(2).join(" ");

			let first = generateTokenAST(tokens[0]);
			let second = generateTokenAST(rightHandSize);

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

		case "list": {
			const obj: AstListNode = {
				type: "list",
				value: removeBlanks(
					tokenise(token.substring(1, token.length - 1))
				)
			};

			return obj;
		}

		case "block": {
			const code = token.substring(1, token.length - 1);

			const obj: AstBlockNode = {
				type: "block",
				value: generateAST(code)
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
							value: generateTokenAST(
								tokens.splice(3, Infinity).join(" ")
							)
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
					const argsWithNoPrebracket = token
						.trim()
						.textAfter("(")
						.trim();
					const args = "(" + argsWithNoPrebracket;

					const endOfBrackets = findEndOfFirstBracket(args);
					const argsWithoutBrackets = args
						.trim()
						.substring(1, endOfBrackets);

					const postArgs = token
						.substring(findEndOfFirstBracket(token) + 1, Infinity)
						.trim();

					const arr = [...tokenise(argsWithoutBrackets), postArgs];
					const argsTokens = removeBlanks(arr);

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
