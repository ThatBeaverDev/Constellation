import { IconGenerator } from "./components/icons.js";
import ConstellationKernel, { Terminatable } from "../kernel.js";
import WindowSystem from "./display/windowSystem.js";
import UiKitInstanceCreator from "./uiKit/uiKit.js";
import { UserInterfaceBase } from "../ui/ui.js";
import { font } from "./uiKit/definitions.js";
import { constructDOMInterface } from "../io/getShadowDom.js";
import { ImageGenerator } from "./components/images.js";

export class GraphicalInterface implements UserInterfaceBase {
	type: "GraphicalInterface" = "GraphicalInterface";
	icons: IconGenerator & Terminatable;
	images: ImageGenerator & Terminatable;

	windowSystem: WindowSystem & Terminatable;
	uiKit: UiKitInstanceCreator & Terminatable;

	getIcon: IconGenerator["getIcon"];
	getImage: ImageGenerator["getImage"];

	// GUI
	#shadowDomHost: HTMLDivElement;
	shadowRoot: ShadowRoot;
	container: HTMLDivElement = document.createElement("div");

	mainStyles: HTMLStyleElement = document.createElement("style");
	bootStyles: HTMLStyleElement = document.createElement("style");

	constructor(ConstellationKernel: ConstellationKernel) {
		const { shadowDOM, container, host } = constructDOMInterface();

		this.shadowRoot = shadowDOM;
		this.#shadowDomHost = host;
		this.container = container;

		// styles ID
		this.mainStyles.id = "/Constellation-Sahara-Ares/styles/styles.css";
		this.bootStyles.id = "/Constellation-Sahara-Ares/styles/boot.css";

		// add styles to shadowDOM
		this.container.appendChild(this.bootStyles);
		this.container.appendChild(this.mainStyles);

		// submodules
		// icon stuff
		this.icons = new IconGenerator(ConstellationKernel);
		this.getIcon = this.icons.getIcon.bind(this.icons);

		// images stuff
		this.images = new ImageGenerator(ConstellationKernel);
		this.getImage = this.images.getImage.bind(this.images);

		// UiKit
		this.uiKit = new UiKitInstanceCreator(ConstellationKernel, this);
		// GUI Windows
		this.windowSystem = new WindowSystem(ConstellationKernel, this);

		// add shadowDOM to screen
		document.body.appendChild(this.#shadowDomHost);
	}

	get displayWidth(): number {
		return this.container.clientWidth;
	}
	set displayWidth(width: number) {
		this.container.style.width = `${width}px`;
	}

	get displayHeight(): number {
		return this.container.clientHeight;
	}
	set displayHeight(height: number) {
		this.container.style.height = `${height}px`;
	}

	get displayScaling(): number {
		return Number(this.container.style.zoom);
	}
	set displayScaling(scale: number) {
		this.container.style.zoom = String(scale);
	}

	async init() {
		this.mainStyles.textContent =
			(await (
				await fetch("/Constellation-Sahara-Ares/styles/styles.css")
			).text()) + `\n\n* {\n\tfont-family: ${font};\n}`;

		this.bootStyles.textContent = await (
			await fetch("/Constellation-Sahara-Ares/styles/boot.css")
		).text();

		await this.uiKit.init();
	}
	postinstall() {}

	setStatus(text: string | Error, state: "working" | "error" = "working") {
		if (text instanceof Error) {
			const style = document.createElement("style");
			style.textContent = `img.bootImage {
	filter: invert(27%) sepia(98%) saturate(7471%) hue-rotate(357deg) brightness(104%) contrast(118%) !important;
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
}`;
			style.id = "failedSystemBoot";
			document.body.appendChild(style);
		}

		const bootText: HTMLParagraphElement =
			document.querySelector("p.bootText")!;

		if (bootText !== null) bootText.innerText = String(text);
	}

	async #reduceState() {
		await this.windowSystem.terminate();
		await this.uiKit.terminate();
	}

	async panic(text: string) {
		this.#reduceState();

		this.container.innerHTML = "";

		const displayElem = document.createElement("p");
		displayElem.innerText = text;

		this.container.appendChild(displayElem);
	}

	async terminate() {
		await this.#reduceState();

		this.#shadowDomHost.remove();
	}
}
