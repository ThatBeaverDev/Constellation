#! /usr/bin/env node

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

	// we now need to insure we're in the right directory, else system installaton will fail.
	// @ts-expect-error
	const entrypoint = process.argv[1];

	const entrypointParent = entrypoint.textBeforeLast("/");
	const projectRoot = entrypointParent.textBeforeLast("/");

	// @ts-expect-error
	process.chdir(projectRoot);
}

async function startupKernel() {
	if (!isCommandLine) {
		document.removeEventListener("keydown", detectKeyPresses);
	}

	const ConstellationKernel = (await import("./kernel.js")).default;
	(window as any).ConstellationKernel = ConstellationKernel;

	let isGraphical = true;
	if (typeof window.document == "undefined" || appliedBootKey == "tuiMode") {
		/* Only boot graphical if in a browser or user requested it, else use console mode */
		isGraphical = false;
	}

	const logs: string[] = [];
	const kernel = new ConstellationKernel("/", isGraphical, logs);
	kernel.lib.logging.log("external", kernel);
}

const bootKeys = {
	tuiMode:
		"Boots the system into TUI mode, which is the default for command line programs.",
	safeMode:
		"Boots the sytem into safe mode, wherein only authorised programs can run."
};
type bootkey = keyof typeof bootKeys;

let appliedBootKey: bootkey | undefined = undefined;

function detectKeyPresses(event: KeyboardEvent) {
	if (appliedBootKey !== undefined) return;

	const key = event.code;

	switch (key) {
		case "KeyS":
			// TODO: implement safe mode
			appliedBootKey = "safeMode";
			break;
		case "KeyT":
			appliedBootKey = "tuiMode";
			break;
	}
}

if (!isCommandLine) {
	document.addEventListener("keydown", detectKeyPresses);
}

setTimeout(startupKernel, 1000);
