import { operations } from "../config.js";
import { AstTokenType } from "../definitions.js";
import {
	findEndOfFirstBracket,
	findEndOfFirstQuotation,
	tokenise
} from "./tokenise.js";

/**
 * Finds the token type of a token
 * @param {string} string - The token to find the typ eof
 * @returns Token type of the token
 */
export function getTokenType(string: string): AstTokenType {
	let token = string.trim();
	if (token[0] == "(") {
		const endOfFirstBracket = findEndOfFirstBracket(token);
		if (endOfFirstBracket == string.length - 1) {
			token = token.substring(1, token.length - 1).trim();
		}
	}

	if (isString(token)) return "str";
	if (isNumber(token)) return "num";
	if (isBoolean(token)) return "bool";
	if (isList(token)) return "list";
	if (isDict(token)) return "dict";

	if (isFunctionCall(token) || isVariableDeclaration(token)) return "code";
	if (isBlock(token)) return "block";
	if (isProperty(token)) return "property";
	if (isVar(token)) return "var";
	if (isOperation(token)) return "operation";

	throw new Error("Tokentype of `" + token + "` cannot be obtained.");
}

function isString(token: string): Boolean {
	let quotes = ['"', '"', "`", "'"];

	if (token[0] !== token.at(-1)) {
		return false;
	}

	if (!quotes.includes(token[0])) {
		return false;
	}

	const indexOfStringExit = findEndOfFirstQuotation(token);
	if (indexOfStringExit !== token.length - 1) {
		return false;
	}

	return true;
}

function isNumber(token: string): Boolean {
	// allow extra cases
	switch (token) {
		case "infinity":
			return true;
		case ".":
		case "-":
		case "-.":
			return false;
	}

	const characters = token.split("");

	let totalDots = 0;
	let hasDigits: boolean = false;
	let i = 0;
	for (const char of characters) {
		switch (char) {
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
			case "0":
				hasDigits = true;
				break;
			case ".":
				if (totalDots > 0) {
					return false;
				}

				// can't just have '-'
				if (token.length == 1) return false;

				totalDots++;
				// dot can't be at the start or end
				if (i !== 0 && i !== characters.length) break;
			case "-":
				// minus MUST be at the start
				if (i == 0) break;
			default:
				return false;
		}

		i++;
	}

	if (hasDigits == false) {
		return false;
	}

	return true;
}

function isBoolean(token: string): Boolean {
	return ["true", "false"].includes(token);
}

function isList(token: string): Boolean {
	return token[0] == "[" && token.at(-1) == "]";
}

function isDict(token: string): Boolean {
	return token.startsWith("#{") && token.at(-1) == "}";
}

function isVar(token: string): Boolean {
	const whitelist = [
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"g",
		"h",
		"i",
		"j",
		"k",
		"l",
		"m",
		"n",
		"o",
		"p",
		"q",
		"r",
		"s",
		"t",
		"u",
		"v",
		"w",
		"x",
		"y",
		"z",
		"_",
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"."
	];

	const chars = token.split("");

	if (chars.length == 0) return false;

	let hasValidCharacters: boolean = false;
	for (const char of chars) {
		if (whitelist.includes(char.toLocaleLowerCase())) {
			hasValidCharacters = true;
		} else {
			return false;
		}
	}

	if (hasValidCharacters == false) {
		return false;
	}

	return true;
}

function isProperty(token: string) {
	return token.includes(".") && token[0] !== ".";
}

function isFunctionCall(token: string): Boolean {
	// find first bracket / curly bracket
	const indexOfBracket = token.indexOf("(");
	const indexOfCurlyBracket = token.indexOf("{");

	let firstTerminator = Math.min(indexOfBracket, indexOfCurlyBracket);
	if (indexOfBracket == -1) {
		firstTerminator = indexOfCurlyBracket;
	}
	if (indexOfCurlyBracket == -1) {
		firstTerminator = indexOfBracket;
	}

	// extract variable part of name
	const func = token.substring(0, firstTerminator).trim();

	// construct checks
	const isValidVariable = isVar(func);
	const containsBracket = token.includes("(");
	const containsCurlyBracket = token.includes("{");

	return isValidVariable && (containsBracket || containsCurlyBracket);
}
function isVariableDeclaration(token: string): Boolean {
	const starters = ["let ", "const ", "global "];

	let ok = false;
	for (const start of starters) {
		if (token.startsWith(start)) {
			ok = true;
		}
	}

	return ok;
}

function isOperation(token: string): Boolean {
	const tokens = tokenise(token, true);

	if (tokens.length % 2 == 0 || tokens.length == 1) {
		return false;
	}

	const operationsList = Object.keys(operations);

	let i = 0;
	for (const innerToken of tokens) {
		if (i % 2 !== 0) {
			if (!operationsList.includes(innerToken)) {
				return false;
			}
		}

		i++;
	}

	return true;
}

function isBlock(token: string): Boolean {
	return token[0] == "{" && token.at(-1) == "}";
}
