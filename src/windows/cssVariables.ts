import conf from "../constellation.config.js";

let live: HTMLElement;

// default variables
const vars: any = {
	"wallpaper-url": `url("${conf.wallpaper}")`
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
	// construct css
	let css = ":root {";
	for (const [key, value] of Object.entries(vars)) {
		const t = "--" + key + ": " + value + ";";
		css += t;
	}
	css += "}";
	live.textContent = css;
}
