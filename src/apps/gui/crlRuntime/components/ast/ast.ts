import {
	OperationReference,
	operations,
	reassignmentOperators,
	ReassignmentReference,
	ReassignmentType
} from "../config.js";
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
	removeBlanks,
	AstDictNode,
	AstPropertyReadoutNode
} from "../definitions.js";
import {
	findEndOfFirstBracket,
	tokenBasedSplit,
	tokenise
} from "./tokenise.js";
import { getTokenType } from "./types.js";

export function generateAST(
	code: string,
	debug: typeof console.debug = (...args: any[]) => {}
) {
	const lines = removeBlanks(
		tokenBasedSplit(code, ";").map((line) => removeComments(line))
	);

	debug(lines);

	const ast = [];
	for (const line of lines) {
		const lineAst = generateLineAST(line, debug);

		debug("AST for line:" + line + " is ", lineAst);

		ast.push(lineAst);
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

function generateLineAST(line: string, debug: typeof console.debug) {
	return generateTokenAST(line, debug);
}

function tokenToNumber(token: string) {
	switch (token) {
		case "infinity":
			return Infinity;
	}

	return Number(token);
}

export function generateTokenAST(
	token: string,
	debug: typeof console.debug
): AstNode {
	debug("Getting token type of '" + token + "'");
	const type = getTokenType(token);

	debug("typeof", token, "is", type);

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

			let first = generateTokenAST(tokens[0], debug);
			let second = generateTokenAST(rightHandSize, debug);

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
				).map((item) => generateTokenAST(item, debug))
			};

			return obj;
		}

		case "dict": {
			const obj: AstDictNode = {
				type: "dict",
				value: new Map()
			};

			const open = token.textAfter("#{").textBeforeLast("}");
			// debugging
			debug("Open dict is", open);

			const tokens = tokenise(open);
			debug("Dict tokens are", tokens);

			const data = removeBlanks(tokens).map((item) => {
				{
					return tokenBasedSplit(item, ":");
				}
			});

			debug("Dict segmented and split is", data);

			for (const set of data) {
				debug("Considering set", set);

				if (set.length !== 2) {
					throw new Error(
						`Object found with ${set.length} tokens. only 2 way splits are valid.`
					);
				}

				const key: AstStringNode = { type: "str", value: set[0] };
				const value: AstNode = generateTokenAST(set[1].trim(), debug);

				debug("Set result is", key, ":", value);

				obj.value.set(key, value);
			}

			return obj;
		}

		case "block": {
			const code = token.substring(1, token.length - 1).trim();

			const obj: AstBlockNode = {
				type: "block",
				value: generateAST(code, debug)
			};

			return obj;
		}

		case "property": {
			const lastDot = token.lastIndexOf(".");
			const leftSide = token.substring(0, lastDot);
			const rightSide = token.substring(lastDot + 1, Infinity);

			const obj: AstPropertyReadoutNode = {
				type: "getProperty",
				value: {
					target: generateTokenAST(leftSide, debug),
					propertyName: { type: "str", value: rightSide }
				}
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
					debug("token", token, " is let declaration");

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
								tokens.splice(3, Infinity).join(" "),
								debug
							)
						}
					};

					return obj;
				}
				case "const": {
					debug("token", token, " is const declaration");

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
							value: generateTokenAST(
								tokens.splice(3, Infinity).join(" "),
								debug
							)
						}
					};

					return obj;
				}
				case "global": {
					debug("token", token, " is global declaration");

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
							value: generateTokenAST(
								tokens.splice(3, Infinity).join(" "),
								debug
							)
						}
					};

					return obj;
				}
				default:
					const reassignmentSymbols = Object.keys(
						reassignmentOperators
					);

					if (reassignmentSymbols.includes(tokens[1])) {
						// reassignment
						debug("token", token, " is reassignment");

						let reassignmentType: ReassignmentReference;
						switch (tokens[1] as ReassignmentType) {
							case "=":
								reassignmentType = "assign";
								break;
							case "+=":
								reassignmentType = "add";
								break;
							case "-=":
								reassignmentType = "minus";
								break;
							case "*=":
								reassignmentType = "multiply";
								break;
							case "/=":
								reassignmentType = "divide";
								break;
							case "**=":
								reassignmentType = "exponent";
								break;
							case "%=":
								reassignmentType = "remainder";
								break;
							default:
								throw new Error(
									`${tokens[1]} is not implemented in AST generation for reassignment.`
								);
						}

						const obj: AstCallNode = {
							type: "code",
							value: {
								type: "reassignment",
								name: tokens[0],
								reassignmentType,
								value: generateTokenAST(
									tokens.splice(2, Infinity).join(" "),
									debug
								)
							}
						};

						return obj;
					} else {
						// function call
						debug("token", token, " is function call");

						let tkn = String(token);
						if (
							tkn.indexOf("(") == -1 ||
							tkn.indexOf("(") > tkn.indexOf("{")
						) {
							tkn = tkn.replace("{", "() {");
							debug("Patched", token, "to", tkn);
						}

						// extract variable name
						const target = tkn.trim().textBefore("(").trim();

						debug("Target is", target, "from", tkn);

						const argsWithNoPrebracket = tkn
							.trim()
							.textAfter("(")
							.trim();
						const args = "(" + argsWithNoPrebracket;

						const endOfBrackets = findEndOfFirstBracket(args);
						const argsWithoutBrackets = args
							.trim()
							.substring(1, endOfBrackets);

						const postArgs = tkn
							.substring(findEndOfFirstBracket(tkn) + 1, Infinity)
							.trim();

						const arr = [
							...tokenise(argsWithoutBrackets),
							postArgs
						];
						const argsTokens = removeBlanks(arr);

						const argsNodes = argsTokens.map((tkn) =>
							generateTokenAST(tkn, debug)
						);

						const obj: AstCallNode = {
							type: "code",
							value: {
								function: generateTokenAST(target, debug),
								type: "functionCall",
								args: argsNodes
							}
						};

						debug("Result of", token, "is", obj);

						return obj;
					}
			}
		}
	}

	throw new Error("Type '" + type + "' was not handled in token generation.");
}
