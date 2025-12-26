import ConstellationKernel from "../../../kernel.js";
import { DOMHandler } from "../../../tui/display.js";
import { TextInterface } from "../../../tui/tui.js";
import { type GraphicalWindow } from "../../display/windowTypes.js";
import { Colour, uikitBoxConfig, uikitIconOptions } from "../definitions.js";
import { defaultConfig } from "./defaultConfig.js";

export default class uiKitCreators {
	#window?: GraphicalWindow;
	textboxElems: Partial<
		Record<number, HTMLInputElement | HTMLTextAreaElement>
	> = {};
	focusedTextbox?: HTMLInputElement | HTMLTextAreaElement;
	embeddedTui?: { container: HTMLDivElement; tui: TextInterface };
	#ConstellationKernel: ConstellationKernel;

	constructor(
		ConstellationKernel: ConstellationKernel,
		window?: GraphicalWindow
	) {
		this.#window = window;

		this.#ConstellationKernel = ConstellationKernel;
	}

	uikitIcon = (
		id: number,
		x = 0,
		y = 0,
		name = "circle-help",
		scale = 1,
		colour: Colour,
		options: uikitIconOptions
	) => {
		const kernel = this.#ConstellationKernel;

		let icon;
		if (!(kernel.ui.type == "GraphicalInterface")) {
			icon = document.createElement("img");
		} else {
			icon = kernel.ui.getIcon(name);
		}

		icon.style.left = `${x}px`;
		icon.style.top = `${y}px`;
		icon.style.width = `${scale * 24}px`;
		icon.style.height = `${scale * 24}px`;
		icon.style.color = colour;

		if (options.borderRadius) {
			icon.style.borderRadius = `${options.borderRadius}px`;
		}

		if (this.#window) this.#window.body.appendChild(icon);

		return icon;
	};

	uikitImage = (
		id: number,
		x: number,
		y: number,
		location: string,
		width: number,
		height: number,
		options: uikitIconOptions
	) => {
		const kernel = this.#ConstellationKernel;

		let image;
		if (!(kernel.ui.type == "GraphicalInterface")) {
			image = document.createElement("img");
		} else {
			image = kernel.ui.getImage(location);
		}

		image.style.left = `${x}px`;
		image.style.top = `${y}px`;
		image.style.width = `${width}px`;
		image.style.height = `${height}px`;

		if (options.borderRadius) {
			image.style.borderRadius = `${options.borderRadius}px`;
		}

		if (this.#window) this.#window.body.appendChild(image);

		return image;
	};

	uikitText = (
		id: number,
		x = 0,
		y = 0,
		string = "",
		fontSize: number,
		colour: Colour,
		font?: string
	) => {
		const text = document.createElement("p");
		text.className = "uikitText";

		text.id = String(window.renderID++);
		text.innerText = string;
		text.style.left = `${x}px`;
		text.style.top = `${y}px`;
		text.style.fontSize = `${fontSize}px`;
		text.style.color = colour;
		if (font) text.style.fontFamily = font;

		if (this.#window) this.#window.body.appendChild(text);

		return text;
	};

	uikitButton = (
		id: number,
		x = 0,
		y = 0,
		string = "",
		leftClickCallback = () => {},
		rightClickCallback = () => {},
		size: number
	) => {
		const button = document.createElement("button");
		button.className = "uikitButton";

		button.id = String(window.renderID++);
		button.innerText = string;
		button.style.cssText = `left: ${x}px; top: ${y}px; font-size: ${size}px;`;

		if (this.#window) this.#window.body.appendChild(button);

		return button;
	};

	uikitTextbox = (
		id: number,
		x = 0,
		y = 0,
		width = 200,
		height = 20,
		backtext = "",
		callbacks = {
			update: (key: string, value: string) => {},
			enter: (value: string) => {}
		},
		options = defaultConfig.uikitTextbox
	) => {
		const textbox = document.createElement("input");
		textbox.type = "text";
		textbox.inputMode = "text";
		textbox.classList.add("uikitTextbox");

		if (options.isInvisible) textbox.classList.add("uikitTextboxInvisible");
		if (options.disableMobileAutocorrect) {
			textbox.autocomplete = "off";
			textbox.autocapitalize = "off";
			textbox.spellcheck = false;
		}
		if (options.font) textbox.style.fontFamily = options.font;

		textbox.id = String(window.renderID++);
		textbox.placeholder = backtext;
		textbox.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;

		if (options.fontSize !== undefined) {
			textbox.style.cssText += `font-size: ${options.fontSize}px;`;
		}

		if (this.#window) this.#window.body.appendChild(textbox);

		if (options.isEmpty == false)
			textbox.value = String(this.textboxElems[id]?.value || ""); // make the value stay

		this.textboxElems[id] = textbox;
		if (this.focusedTextbox == undefined) this.focusedTextbox = textbox;

		textbox.addEventListener("focus", () => {
			this.focusedTextbox = textbox;
		});

		return textbox;
	};

	uikitVerticalLine = (id: number, x: number, y: number, height: number) => {
		const line = document.createElement("div");
		line.className = "uikitVerticalLine";

		line.id = String(window.renderID++);
		line.style.cssText = `left: ${x}px; top: ${y}px; height: ${height}px;`;

		if (this.#window) this.#window.body.appendChild(line);

		return line;
	};

	uikitHorizontalLine = (
		id: number,
		x: number,
		y: number,
		width: number,
		colour: Colour
	) => {
		const line = document.createElement("div");
		line.className = "uikitHorizontalLine";

		line.id = String(window.renderID++);
		line.style.left = `${x}px`;
		line.style.top = `${y}px`;
		line.style.width = `${width}px`;
		line.style.borderColor = colour;

		if (this.#window) this.#window.body.appendChild(line);

		return line;
	};

	uikitProgressBar = (
		id: number,
		x: number,
		y: number,
		width: number,
		height: number,
		progress: number | "throb",
		onDrag: (progress: number) => Promise<void> | void,
		colour: string = "panel"
	) => {
		const bar = document.createElement("div");
		bar.style.left = `${x}px`;
		bar.style.top = `${y}px`;

		bar.style.width = `${width}px`;
		bar.style.height = `${height}px`;

		bar.id = String(window.renderID++);
		bar.className = "uikitProgressBar";

		const progressBar = document.createElement("div");

		progressBar.style.width = progress + "%";
		progressBar.id = String(window.renderID++);
		progressBar.className = "uikitProgressBarInner";

		if (colour == "panel") {
			if (this.#window?.container.classList.contains("frosted")) {
				progressBar.style.background = "";
				progressBar.classList.add("glass");
			} else {
				progressBar.style.background = `var(--panelColour)`;
				progressBar.style.backdropFilter = `blur(var(--headerBlur))`;
			}
		} else {
			progressBar.style.background = `${colour || "var(--bg-light)"}`;
		}

		bar.appendChild(progressBar);

		if (this.#window) this.#window.body.appendChild(bar);

		return bar;
	};

	uikitTextarea = (
		id: number,
		x: number = 0,
		y: number = 0,
		width: number = 100,
		height: number = 50,
		callbacks: any,
		options = defaultConfig.uikitTextarea
	) => {
		const area = document.createElement("textarea");
		area.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
		area.id = String(window.renderID++);
		area.inputMode = "text";
		area.className = "uikitTextarea";

		if (options.isInvisible) area.classList.add("uikitTextboxInvisible");
		if (options.disableMobileAutocorrect) {
			area.autocomplete = "off";
			area.autocapitalize = "off";
			area.spellcheck = false;
		}
		if (options.font) area.style.fontFamily = options.font;

		if (this.#window) this.#window.body.appendChild(area);

		const focusedWindow = !(
			this.#ConstellationKernel.ui.type == "GraphicalInterface"
		)
			? undefined
			: this.#ConstellationKernel.ui.windowSystem.focusedWindow;

		if (focusedWindow == this.#window?.winID) area.focus();

		area.value = String(this.textboxElems[id]?.value || ""); // make the value stay
		this.textboxElems[id] = area;

		if (this.focusedTextbox == undefined) this.focusedTextbox = area;

		area.addEventListener("focus", () => {
			this.focusedTextbox = area;
		});

		return area;
	};

	uikitBox = (
		id: number,
		x: number = 0,
		y: number = 100,
		width: number = 100,
		height: number = 100,
		config?: uikitBoxConfig
	) => {
		const box = document.createElement("div");
		box.id = String(window.renderID++);
		box.classList.add("uikitBox");

		box.style.left = `${x}px`;
		box.style.top = `${y}px`;
		box.style.width = `${width}px`;
		box.style.height = `${height}px`;

		if (config?.background == "panel") {
			if (this.#window?.container.classList.contains("frosted")) {
				box.style.background = "";
				box.classList.add("glass");
			} else {
				box.style.background = `var(--panelColour)`;
				box.style.backdropFilter = `blur(var(--headerBlur))`;
			}
		} else {
			box.style.background = `${config?.background || "var(--bg-light)"}`;
		}

		const borderRadius = config?.borderRadius;
		if (borderRadius) {
			if (borderRadius instanceof Array) {
				box.style.borderRadius = `${borderRadius.join("px ")}px`;
			} else {
				box.style.borderRadius = `${borderRadius}px`;
			}
		}

		if (config?.isFrosted == true) box.classList.add("frosted");

		if (this.#window) this.#window.body.appendChild(box);

		return box;
	};
	uikitCanvas2D = (
		id: number,
		x: number,
		y: number,
		width: number,
		height: number
	) => {
		const canvas = document.createElement("canvas");
		canvas.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
		canvas.width = width;
		canvas.height = height;
		canvas.id = String(window.renderID++);
		canvas.className = "uikitCanvas";

		if (this.#window) this.#window.body.appendChild(canvas);

		return canvas;
	};

	uikitEmbeddedTui = (
		id: number,
		x: number,
		y: number,
		width: number,
		height: number
	) => {
		if (this.embeddedTui) {
			throw new Error("Each window may only have one embedded TUI.");
		}

		const container = document.createElement("div");
		container.id = String(window.renderID++);
		container.classList.add("uikitBox", "uiKitEmbeddedTui");

		container.style.left = `${x}px`;
		container.style.top = `${y}px`;
		container.style.width = `${width}px`;
		container.style.height = `${height}px`;
		container.style.fontFamily = "monospace";

		const displayDriver = new DOMHandler(
			this.#ConstellationKernel,
			container
		);
		const tui = new TextInterface(this.#ConstellationKernel, displayDriver);
		tui.init();
		tui.postinstall();

		if (this.#window) this.#window.body.appendChild(container);

		this.embeddedTui = {
			container,
			tui
		};

		return container;
	};

	uikitIframe = (
		id: number,
		x: number,
		y: number,
		width: number,
		height: number,
		url: string,
		onMessage: (data: any) => Promise<void> | void,
		isTransparent: boolean
	) => {
		const iframe = document.createElement("iframe");
		iframe.id = String(window.renderID++);
		iframe.classList.add("uikitIframe");

		iframe.style.left = `${x}px`;
		iframe.style.top = `${y}px`;
		iframe.style.width = `${width}px`;
		iframe.style.height = `${height}px`;
		iframe.style.border = "none";
		if (isTransparent) {
			iframe.style.background = "transparent";
			iframe.setAttribute("allowtransparency", "true");
		}

		iframe.src = url;

		if (this.#window) this.#window.body.appendChild(iframe);

		return iframe;
	};
}
