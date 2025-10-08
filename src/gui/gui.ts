import { keyboardShortcutsAPI } from "../fs/keyboardShortcuts.js";
import { Icons } from "./icons.js";
import ConstellationKernel, { Terminatable } from "../kernel.js";
import WindowSystem from "./display/windowSystem.js";
import UiKitInstanceCreator from "./uiKit/uiKit.js";

export class GraphicalInterface implements Terminatable {
	icons: Icons & Terminatable;
	getIcon: Icons["getIcon"];
	windowSystem: WindowSystem & Terminatable;
	keyboardShortcuts: keyboardShortcutsAPI & Terminatable;
	uiKit: UiKitInstanceCreator & Terminatable;

	// GUI
	#containerDiv: HTMLDivElement;
	shadowRoot: ShadowRoot;
	container: HTMLDivElement = document.createElement("div");

	mainStyles: HTMLStyleElement = document.createElement("style");
	bootStyles: HTMLStyleElement = document.createElement("style");

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#containerDiv = document.createElement("div");
		const d = this.#containerDiv;
		d.className = "graphicalOutput";

		const shadowDOM = this.#containerDiv.attachShadow({ mode: "open" });
		this.shadowRoot = shadowDOM;

		// body div
		this.container.className = "overlay";
		this.shadowRoot.appendChild(this.container);

		// styles ID
		this.mainStyles.id = "/styles/styles.css";
		this.bootStyles.id = "/styles/boot.css";

		// add styles to shadowDOM
		this.container.appendChild(this.bootStyles);
		this.container.appendChild(this.mainStyles);

		// submodules
		// icon stuff
		this.icons = new Icons(ConstellationKernel);
		this.getIcon = this.icons.getIcon.bind(this.icons);
		// UiKit
		this.uiKit = new UiKitInstanceCreator(ConstellationKernel, this);
		// GUI Windows
		this.windowSystem = new WindowSystem(ConstellationKernel, this);
		// keyboard shortcuts
		this.keyboardShortcuts = new keyboardShortcutsAPI(ConstellationKernel);

		// add shadowDOM to screen
		document.body.appendChild(this.#containerDiv);
	}

	get displayWidth() {
		return this.container.clientWidth;
	}
	set displayWidth(width: number) {
		this.container.style.width = `${width}px`;
	}

	get displayHeight() {
		return this.container.clientHeight;
	}
	set displayHeight(height: number) {
		this.container.style.height = `${height}px`;
	}

	async init() {
		this.mainStyles.textContent = await (
			await fetch("/styles/styles.css")
		).text();

		this.bootStyles.textContent = await (
			await fetch("/styles/boot.css")
		).text();

		await this.uiKit.init();
	}

	setStatus(text: string | Error, state: "working" | "error" = "working") {
		if (text instanceof Error) {
			const style = document.createElement("style");
			style.textContent = `
			img.bootImage {
				filter: hue-rotate(80deg) saturate(1000%) !important;
			}
	
			p.bootText {
				color: red !important;
			}
	
			span.loader {
				border-color: red !important;
			}
	
			span.loader::after {
				background-color: red !important;
				animation: none !important;
				width: 100%;
			}
			`;
			this.container.appendChild(style);

			setTimeout(() => {
				throw text;
			}, 5000);
		}
	}

	async terminate() {
		await this.windowSystem.terminate();
		await this.keyboardShortcuts.terminate();
		await this.uiKit.terminate();

		this.#containerDiv.remove();
	}
}
