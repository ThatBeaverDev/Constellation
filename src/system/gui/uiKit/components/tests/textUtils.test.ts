import { JSDOM as JsDom } from "jsdom";
import { createCanvas } from "canvas";

import { runTests } from "../../../../../tests/libtest.js";
import { getTextHeight, getTextWidth, insertNewlines } from "../textUtils.js";

const dom = new JsDom('<!DOCTYPE html><canvas id="hiddenCanvas" />');
global.document = dom.window.document;

// Monkey-patch canvas elements so getContext works
// @ts-expect-error
dom.window.HTMLCanvasElement.prototype.getContext = function () {
	return createCanvas(this.width, this.height).getContext("2d");
};

// this is the best I can do. not great, I'll admit.

const { logs } = await runTests([
	// --- getTextWidth ---
	{
		function: getTextWidth,
		args: ["", 20],
		expectedResult: 0
	},

	// --- getTextHeight ---
	{
		function: getTextHeight,
		args: ["Hello"],
		expectedResult: 15 * 1.2 // one line, default size
	},
	{
		function: getTextHeight,
		args: ["Hello\nWorld", 10],
		expectedResult: 2 * 10 * 1.2 // two lines, size=10
	},

	// --- insertNewlines ---
	{
		function: insertNewlines,
		args: ["Short text", 1000], // maxWidth very large
		expectedResult: "Short text"
	},
	{
		function: insertNewlines,
		args: ["This is a long line that should wrap", 10],
		expectedResult: "This\nis a\nlong\nline\nthat\nshould\nwrap"
	},
	{
		function: insertNewlines,
		args: ["word", 1], // force break immediately
		expectedResult: "word"
	}
]);

console.log(logs);
