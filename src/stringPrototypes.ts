declare global {
	interface String {
		textAfter(after: string): string;
		textAfterAll(after: string): string;
		textBefore(before: string): string;
		textBeforeLast(before: string): string;
		map(mappings: Record<string, string>): string;
	}
}

export default function applyStringPrototypes() {
	String.prototype.textAfter = function (after) {
		return this.split(after).splice(1, Infinity).join(after);
	};

	String.prototype.textAfterAll = function (after) {
		return this.split(after).pop() ?? "";
	};

	String.prototype.textBefore = function (before) {
		return this.substring(0, this.indexOf(before));
	};

	String.prototype.textBeforeLast = function (before) {
		return this.split("")
			.reverse()
			.join("")
			.textAfter(before)
			.split("")
			.reverse()
			.join("");
	};

	String.prototype.map = function (mappings) {
		let text = String(this);

		for (const replaced in mappings) {
			text = text.replaceAll(replaced, mappings[replaced]);
		}

		return text;
	};

	/**
	 * Removes leading and trailing spaces, newlines and tabs.
	 * @param text - The text to act on
	 * @returns the trimmed text
	 */
	function trim(text: string): string {
		let start = 0;
		let end = text.length - 1;

		const isWhitespace = (c: string) =>
			c === " " || c === "\t" || c === "\n" || c == " ";

		while (start <= end) {
			const c = text[start];
			if (isWhitespace(c)) {
				start++;
			} else {
				break;
			}
		}

		while (end >= start) {
			const c = text[end];
			if (isWhitespace(c)) {
				end--;
			} else {
				break;
			}
		}

		return text.substring(start, end + 1);
	}

	String.prototype.trim = function () {
		return trim(this as string);
	};
}
