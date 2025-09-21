import { AstTokenType } from "../definitions.js";

export function getTokenType(text: string): AstTokenType {
	let token = text.trim();
	if (token[0] == "(" && token.at(-1) == ")")
		token = token.substring(1, token.length - 1);

	if (isString(token)) return "str";
	if (isNumber(token)) return "num";
	if (isBoolean(token)) return "bool";
	if (isList(token)) return "list";
	if (isDict(token)) return "dict";

	if (isVar(token)) return "var";
	if (isFunctionCall(token) || isVariableDeclaration(token)) return "code";

	throw new Error("Tokentype of `" + token + "` cannot be obtained.");
}

function isString(token: string): Boolean {
	let quotes = ['"', '"', "`", "'"];

	if (token[0] == token.at(-1)) {
		if (quotes.includes(token[0])) {
			return true;
		}
	}

	return false;
}

function isNumber(token: string): Boolean {
	// allow extra cases
	switch (token) {
		case "infinity":
			return true;
	}

	const characters = token.split("");

	let totalDots = 0;
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
				break;
			case ".":
				if (totalDots > 0) {
					return false;
				}

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

	return true;
}

function isBoolean(token: string): Boolean {
	return ["true", "false"].includes(token);
}

function isList(token: string): Boolean {
	// TODO: IMPLEMENT!
	return false;
}

function isDict(token: string): Boolean {
	// TODO: IMPLEMENT!
	return false;
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
		"9"
	];

	const chars = token.split("");

	for (const char of chars) {
		if (!whitelist.includes(char.toLocaleLowerCase())) {
			return false;
		}
	}

	return true;
}

function isFunctionCall(token: string): Boolean {
	const func = token.textBefore("(").trim();

	return isVar(func) && token.includes("(");
}
function isVariableDeclaration(token: string): Boolean {
	const starts = ["let ", "const ", "global "];

	let ok = false;
	for (const start of starts) {
		if (token.startsWith(start)) {
			ok = true;
		}
	}

	return ok;
}

function detectFunction(token: string): Boolean {
	return false;
}
detectFunction;
