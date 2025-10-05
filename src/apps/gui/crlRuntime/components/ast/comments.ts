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
