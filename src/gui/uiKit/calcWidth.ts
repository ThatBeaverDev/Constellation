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
