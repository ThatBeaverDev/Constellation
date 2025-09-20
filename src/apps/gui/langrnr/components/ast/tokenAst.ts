import {
	AstNode,
	AstStringNode,
	AstBooleanNode,
	AstNumberNode,
	AstVariableNode,
	AstCallNode,
	removeBlanks
} from "../definitions.js";
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
		case "call": {
			const tokens = tokenise(token, true);

			console.log(tokens);

			switch (tokens[0]) {
				case "let": {
					if (tokens[2] !== "=") {
						throw new Error(
							`(${tokens[2]} is not valid during variable declaration`
						);
					}

					const obj: AstCallNode = {
						type: "call",
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
						type: "call",
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
						type: "call",
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

					const argsTokens = tokenise(argsWithoutBrackets);

					const argsNodes = argsTokens.map((token) =>
						generateTokenAST(token)
					);

					const obj: AstCallNode = {
						type: "call",
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

export function tokenise(
	text: string,
	splitOnSpaces: boolean = false
): string[] {
	const result: string[] = [];
	let staging = "";

	let brackets: ("[]" | "()" | "{}")[] = [];
	//let quotes: '"' | "'" | "`" | "" = "";
	let quotes: string = "";

	const characters = text.split("");

	function commit() {
		result.push(staging.trim());
		staging = "";
	}

	for (const char of characters) {
		function stage() {
			staging += char;
		}

		switch (char) {
			case "\t":
			case " ":
				if (!splitOnSpaces) {
					stage();
					break;
				}
			case ",":
				if (quotes == "" && brackets.length == 0) {
					commit();
				} else {
					stage();
				}
				break;

			// brackets
			case "(":
				if (quotes !== "") {
					stage();
					break;
				}

				brackets.push("()");
				stage();
				break;
			case ")":
				if (quotes !== "") {
					stage();
					break;
				}

				if (brackets.at(-1) == "()") {
					brackets.pop();
				} else {
					throw new Error(
						"SyntaxError: Bracket closure was invalid."
					);
				}
				stage();
				break;

			// square brackets
			case "[":
				if (quotes !== "") {
					stage();
					break;
				}

				brackets.push("[]");
				stage();
				break;
			case "]":
				if (quotes !== "") {
					stage();
					break;
				}

				if (brackets.at(-1) == "[]") {
					brackets.pop();
				} else {
					throw new Error(
						"SyntaxError: Bracket closure was invalid."
					);
				}
				stage();
				break;

			// curly brackets
			case "{":
				if (quotes !== "") {
					stage();
					break;
				}

				brackets.push("{}");
				stage();
				break;
			case "}":
				if (quotes !== "") {
					stage();
					break;
				}

				if (brackets.at(-1) == "{}") {
					brackets.pop();
				} else {
					throw new Error(
						"SyntaxError: Bracket closure was invalid."
					);
				}
				stage();
				break;

			// quotes
			case '"':
			case "'":
			case "`":
				if (brackets.length !== 0) {
					stage();
					break;
				}

				if (quotes == char) {
					quotes = "";
				} else {
					if (quotes == "") {
						quotes = char;
					}
				}

				stage();
				break;

			default:
				stage();
		}
	}

	commit();

	if (brackets.length !== 0) {
		throw new Error("More brackets where opened than were closed!");
	}
	if (quotes !== "") {
		throw new Error("Quotes were not closed properly!");
	}

	if (splitOnSpaces == true) {
		return removeBlanks(result);
	} else {
		return result;
	}
}
