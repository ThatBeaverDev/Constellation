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
