import { font, uiKitInitialisationError } from "../definitions.js";

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

function init() {
	if (canvas == null) {
		canvas = document.querySelector("canvas#hiddenCanvas");
		if (canvas == null)
			throw new uiKitInitialisationError(
				"document.getQuerySelector for canvas#hiddenCavnas returned null."
			);
		ctx = canvas.getContext("2d");
	}
}

export function getTextWidth(
	text: string,
	size = 15,
	fontFamily = font,
	round = true
) {
	init();

	if (ctx == null) throw new uiKitInitialisationError("ctx is null.");
	ctx.font = `${size}px ${fontFamily}`;

	let maxWidth: number = 0;
	const lines = String(text).split("\n");
	for (const line of lines) {
		const width = ctx.measureText(line).width;

		if (width > maxWidth) {
			maxWidth = width;
		}
	}

	if (round) {
		return Math.round(maxWidth);
	} else {
		return maxWidth;
	}
}

export function getTextHeight(
	text: string,
	size = 15,
	fontFamily = font,
	round = true
) {
	const height = String(text).split("\n").length * size * 1.2;

	if (round) {
		return Math.round(height);
	} else {
		return height;
	}
}

const newLinesMap = new Map<[string, number, number, string], string>();
export function insertNewlines(
	text: string,
	maxWidth: number,
	size = 15,
	fontFamily = font
): string {
	return (
		newLinesMap.get([text, maxWidth, size, fontFamily]) ??
		_insertNewlines(text, maxWidth, size, fontFamily)
	);
}
function _insertNewlines(
	text: string,
	maxWidth: number,
	size = 15,
	fontFamily = font
): string {
	const spaceWidth = getTextWidth(" ", size, fontFamily);

	const words = text.split(" ");
	let result = "";
	let runningWidth = 0;

	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const wordWidth = getTextWidth(word, size, fontFamily);

		if (
			runningWidth > 0 &&
			runningWidth + spaceWidth + wordWidth > maxWidth
		) {
			result = result.trimEnd() + "\n";
			runningWidth = 0;
		}

		// add the word
		result += word + " ";
		runningWidth += runningWidth === 0 ? wordWidth : spaceWidth + wordWidth;
	}

	return result.trim();
}
