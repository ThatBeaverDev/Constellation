import * as conf from "../constellation.config.js";
import { windowsTimestamp } from "./windows.js";

let live: HTMLElement;

// default variables
const vars: any = {
	"wallpaper-url": `url("${conf.wallpaper}")`,
	"wallpaper-position": conf.wallpaperPosition
};

export function initialiseStyles() {
	// construct style element
	let style = document.createElement("style");
	style.id = String(window.renderID++);

	document.body.appendChild(style);
	live = document.getElementById(style.id)!;

	refreshCSS();
}

export function setCSSVariable(key: string, value: string) {
	vars[key] = value;

	refreshCSS();
}

function refreshCSS() {
	const start = performance.now();

	// construct css
	let css = ":root {\n";
	for (const [key, value] of Object.entries(vars)) {
		const t = "\t--" + key + ": " + value + ";\n";
		css += t;
	}
	css += "}";
	live.textContent = css;

	windowsTimestamp("Refresh Variable CSS", start);
}
