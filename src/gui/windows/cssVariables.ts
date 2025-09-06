import ConstellationKernel from "../../kernel.js";
import { windowsTimestamp } from "./windows.js";

export default class cssVariables {
	live: HTMLElement;
	vars: Record<string, string> = {};
	ConstellationKernel: ConstellationKernel;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.ConstellationKernel = ConstellationKernel;

		// default variables
		this.vars = {
			"wallpaper-url": `url("${this.ConstellationKernel.config.wallpaper}")`,
			"wallpaper-position":
				this.ConstellationKernel.config.wallpaperPosition
		};

		// construct style element
		let style = document.createElement("style");
		style.id = String(window.renderID++);

		document.body.appendChild(style);
		this.live = document.getElementById(style.id)!;

		this.refreshCSS();
	}

	setCSSVariable(key: string, value: string) {
		this.vars[key] = value;

		this.refreshCSS();
	}

	refreshCSS() {
		const start = performance.now();

		// construct css
		let css = ":root {\n";
		for (const [key, value] of Object.entries(this.vars)) {
			const t = "\t--" + key + ": " + value + ";\n";
			css += t;
		}
		css += "}";
		this.live.textContent = css;

		windowsTimestamp("Refresh Variable CSS", start);
	}
}
