const canvas = document.getElementById("hiddenCanvas");
const ctx = canvas.getContext("2d");

export function getTextWidth(text, size = 15, fontFamily = "Arial") {
	ctx.font = `${size}px ${fontFamily}`;
	return ctx.measureText(text).width;
}

export function getTextHeight(text, size = 15, fontFamily = "Arial") {
	ctx.font = `${size}px ${fontFamily}`;
	return ctx.measureText(text).height;
}
