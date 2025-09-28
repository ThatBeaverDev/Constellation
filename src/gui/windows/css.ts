import ConstellationKernel from "../../kernel.js";
import { GraphicalInterface } from "../gui.js";
import { windowsTimestamp } from "./windows.js";

export default class cssVariables {
	live: HTMLElement;
	vars: Record<string, string> = {};
	#ConstellationKernel: ConstellationKernel;
	#GraphicalInterface: GraphicalInterface;

	constructor(
		ConstellationKernel: ConstellationKernel,
		GraphicalInterface: GraphicalInterface
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.#GraphicalInterface = GraphicalInterface;

		// default variables
		this.vars = {
			"wallpaper-url": `url("${this.#ConstellationKernel.config.wallpaper}")`,
			"wallpaper-position":
				this.#ConstellationKernel.config.wallpaperPosition
		};

		// construct style element
		let style = document.createElement("style");
		style.id = String(window.renderID++);

		GraphicalInterface.container.appendChild(style);
		this.live = style;

		this.refreshCSS();
	}

	setCSSVariable(key: string, value: string) {
		this.vars[key] = value;

		this.refreshCSS();
	}

	refreshCSS() {
		const start = performance.now();

		// construct css
		let css = ":host {\n";
		for (const [key, value] of Object.entries(this.vars)) {
			const t = "\t--" + key + ": " + value + ";\n";
			css += t;
		}
		css += "}";
		this.live.textContent = css;

		windowsTimestamp("Refresh Variable CSS", start);
	}

	#elements: HTMLStyleElement[] = [];
	async applyWindowCSS() {
		const files = [
			"/styles/windowSnapping.css",
			"/styles/windowHeader.css",
			"/styles/windowBody.css"
		];

		const elems: HTMLStyleElement[] = [];

		for (const i in files) {
			const elem = document.createElement("style");
			elem.id = files[i];

			elems.push(elem);
			this.#GraphicalInterface.container.appendChild(elem);
			this.#elements.push(elem);
		}

		for (const i in elems) {
			const elem = elems[i];

			elem.textContent = await (await fetch(files[i])).text();
		}
	}

	async terminate() {
		this.#elements.forEach((elem) => elem.remove());

		this.live.remove();
	}
}
