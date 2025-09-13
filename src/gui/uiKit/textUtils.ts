import { font, uiKitInitialisationError } from "./definitions.js";

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

export function getTextWidth(text: string, size = 15, fontFamily = font) {
	init();

	if (ctx == null) throw new uiKitInitialisationError("ctx is null.");

	ctx.font = `${size}px ${fontFamily}`;
	return ctx.measureText(text).width;
}

export function getTextHeight(text: string, size = 15, fontFamily = font) {
	return text.split("\n").length * size * 1.2;
}

export function insertNewlines(
	text: string,
	maxWidth: number,
	size = 15,
	fontFamily = font
): string {
	const width = getTextWidth(text, size, fontFamily);

	// make sure it's not already short enough
	if (width < maxWidth) {
		return text;
	}

	const words = text.split(" ");
	let result: string = "";

	let runningWidth: number = 0;
	for (let i = 0; i < words.length; i++) {
		let idx = Number(i);
		const word = words[idx];

		const width = getTextWidth(word, size, fontFamily);
		runningWidth += width;

		if (runningWidth > maxWidth) {
			result = result.trim() + "\n";
			runningWidth = 0;
		}

		result += word + " ";
	}

	return result.trim();
}
