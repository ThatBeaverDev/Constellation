import { removeBlanks } from "../definitions.js";

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

	let i = 0;
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
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
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
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
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
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
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

		i++;
	}

	commit();

	if (brackets.length !== 0) {
		throw new Error(
			`More brackets where opened than were closed! (in ${text})`
		);
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

export function findEndOfFirstBracket(text: string): number {
	let quotes: '"' | "'" | "`" | "" = "";
	let brackets: ("()" | "[]" | "{}")[] = [];

	const chars = text.split("");

	let i = 0;
	for (const char of chars) {
		switch (char) {
			// brackets
			case "(":
				if (quotes !== "") {
					break;
				}

				brackets.push("()");
				break;
			case ")":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "()") {
					brackets.pop();

					if (brackets.length == 0) return i;
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// square brackets
			case "[":
				if (quotes !== "") {
					break;
				}

				brackets.push("[]");
				break;
			case "]":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "[]") {
					brackets.pop();

					if (brackets.length == 0) return i;
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// curly brackets
			case "{":
				if (quotes !== "") {
					break;
				}

				brackets.push("{}");
				break;
			case "}":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "{}") {
					brackets.pop();

					if (brackets.length == 0) return i;
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// quotes
			case '"':
			case "'":
			case "`":
				if (brackets.length !== 0) {
					break;
				}

				if (quotes == char) {
					quotes = "";
				} else {
					if (quotes == "") {
						quotes = char;
					}
				}
				break;

			default:
		}

		i++;
	}

	return -1;
}

export function findEndOfFirstQuotation(text: string): number {
	let quotes: '"' | "'" | "`" | "" = "";
	let brackets: ("()" | "[]" | "{}")[] = [];

	const chars = text.split("");

	let i = 0;
	for (const char of chars) {
		switch (char) {
			// brackets
			case "(":
				if (quotes !== "") {
					break;
				}

				brackets.push("()");
				break;
			case ")":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "()") {
					brackets.pop();

					if (brackets.length == 0) return i;
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// square brackets
			case "[":
				if (quotes !== "") {
					break;
				}

				brackets.push("[]");
				break;
			case "]":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "[]") {
					brackets.pop();
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// curly brackets
			case "{":
				if (quotes !== "") {
					break;
				}

				brackets.push("{}");
				break;
			case "}":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "{}") {
					brackets.pop();
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// quotes
			case '"':
			case "'":
			case "`":
				if (brackets.length !== 0) {
					break;
				}

				if (quotes == char) {
					quotes = "";
					if (brackets.length == 0) return i;
				} else {
					if (quotes == "") {
						quotes = char;
					}
				}
				break;

			default:
		}

		i++;
	}

	return -1;
}

export function findFirstValid(text: string, character: string): number {
	if (character.length !== 1) {
		throw new Error("can only search for one character!");
	}

	let quotes: '"' | "'" | "`" | "" = "";
	let brackets: ("()" | "[]" | "{}")[] = [];

	const chars = text.split("");

	let i = 0;
	for (const char of chars) {
		switch (char) {
			// brackets
			case "(":
				if (quotes !== "") {
					break;
				}

				brackets.push("()");
				break;
			case ")":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "()") {
					brackets.pop();
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// square brackets
			case "[":
				if (quotes !== "") {
					break;
				}

				brackets.push("[]");
				break;
			case "]":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "[]") {
					brackets.pop();
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// curly brackets
			case "{":
				if (quotes !== "") {
					break;
				}

				brackets.push("{}");
				break;
			case "}":
				if (quotes !== "") {
					break;
				}

				if (brackets.at(-1) == "{}") {
					brackets.pop();
				} else {
					throw new Error(
						`SyntaxError: Bracket closure was invalid. (${text.substring(i - 4, i)} ->${text[i]}<- ${text.substring(i + 1, i + 4)}), ${JSON.stringify(brackets)}`
					);
				}
				break;

			// quotes
			case '"':
			case "'":
			case "`":
				if (brackets.length !== 0) {
					break;
				}

				if (quotes == char) {
					quotes = "";
				} else {
					if (quotes == "") {
						quotes = char;
					}
				}
				break;

			default:
				if (quotes == "" && brackets.length == 0 && char == character) {
					return i;
				}
		}

		i++;
	}

	return -1;
}

export function tokenBasedSplit(text: string, splitter: string) {
	if (splitter.length !== 1) {
		throw new Error("can only search for one character!");
	}

	const result: string[] = [];
	let runningText = String(text);
	while (true) {
		let next = findFirstValid(runningText, splitter);
		result.push(runningText.substring(0, next));

		runningText = runningText.substring(next + 1, Infinity);

		if (next == -1 || runningText == "") {
			result.push(runningText);
			break;
		}
	}

	return removeBlanks(result);
}
