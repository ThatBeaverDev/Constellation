import { isCommandLine } from "./getPlatform.js";

// allow `declare global`.
export {};

declare global {
	interface String {
		textAfter(after: string): string;
		textAfterAll(after: string): string;
		textBefore(before: string): string;
		textBeforeLast(before: string): string;
		map(mappings: any): string;
	}
}
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

if (isCommandLine) {
	// this is node(like), we need `window` to be valid to proceed.
	// @ts-expect-error
	global.window = global;

	(window as any).location = {
		hash: "",
		host: "localhost:5174",
		hostname: "localhost",
		href: "https://localhost:5174",
		origin: "https://localhost:5174",
		pathname: "/",
		port: "5174",
		protocol: "https:",
		search: "",
		toString() {
			return "https://localhost:5174";
		}
	};
}

const ConstellationKernel = (await import("./kernel.js")).default;
(window as any).ConstellationKernel = ConstellationKernel;

const logs: string[] = [];
const kernel = new ConstellationKernel(
	"/",
	typeof window.document !==
		"undefined" /* Only boot graphical if in a browser, else use console mode */,
	logs
);
kernel.lib.logging.log("external", kernel);
