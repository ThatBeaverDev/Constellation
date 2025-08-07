import { font, uiKitInitialisationError } from "./definitions.js";

const canvas: HTMLCanvasElement | null = document.querySelector(
	"canvas#hiddenCanvas"
);

if (canvas == null)
	throw new uiKitInitialisationError(
		"document.getQuerySelector for canvas#hiddenCavnas returned null."
	);
const ctx = canvas.getContext("2d");

export function getTextWidth(text: string, size = 15, fontFamily = font) {
	if (ctx == null) throw new uiKitInitialisationError("ctx is null.");

	ctx.font = `${size}px ${fontFamily}`;
	return ctx.measureText(text).width;
}
