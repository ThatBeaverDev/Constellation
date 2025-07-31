import { UIError } from "../../errors.js";
import { GraphicalWindow, focus } from "../../windows/windows.js";
import { dataUriToBlobUrl } from "../blobify.js";
import { getIcon } from "../icons.js";
import {
	canvasPosition,
	canvasRenderingStep,
	uiKitTimestamp,
	uikitBoxConfig,
	uikitCanvasOptions
} from "./definitions.js";
import { Renderer } from "./uiKit.js";

export default class uiKitCreators {
	#parent: Renderer;
	#window: GraphicalWindow;
	textboxElem: HTMLInputElement | HTMLTextAreaElement | undefined;
	hasTextbox: boolean = false;

	constructor(parent: Renderer, window: GraphicalWindow) {
		this.#parent = parent;

		this.#window = window;
	}

	uikitIcon = (
		x = 0,
		y = 0,
		name = "circle-help",
		scale = 1,
		colour: string
	) => {
		const icon = getIcon(name);
		icon.style.left = `${x}px`;
		icon.style.top = `${y}px`;
		icon.style.width = `${scale * 24}px`;
		icon.style.height = `${scale * 24}px`;
		icon.style.color = colour;

		this.#window.body.appendChild(icon);

		if (icon == null)
			throw new UIError("uikit element has disappeared in processing");

		return icon;
	};

	uikitText = (x = 0, y = 0, string = "", size: number, colour: string) => {
		const text = document.createElement("p");
		text.className = "uikitText";

		text.id = String(window.renderID++);
		text.innerText = string;
		text.style.left = `${x}px`;
		text.style.top = `${y}px`;
		text.style.fontSize = `${size}px`;
		text.style.color = colour;

		this.#window.body.appendChild(text);

		if (text == null)
			throw new UIError("uikit element has disappeared in processing");

		return text;
	};

	uikitButton = (
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

		this.#window.body.appendChild(button);

		if (button == null)
			throw new UIError("uikit element has disappeared in processing");

		return button;
	};

	uikitTextbox = (
		x = 0,
		y = 0,
		width = 200,
		height = 20,
		backtext = "",
		callbacks = {
			update: (key: string, value: string) => {},
			enter: (value: string) => {}
		},
		options = this.#parent.defaultConfig.uikitTextbox
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

		textbox.id = String(window.renderID++);
		textbox.placeholder = backtext;
		textbox.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;

		if (options.fontSize !== undefined) {
			textbox.style.cssText += `font-size: ${options.fontSize}px;`;
		}

		this.#window.body.appendChild(textbox);

		if (textbox == null)
			throw new UIError("uikit element has disappeared in processing");

		if (options.isEmpty == false)
			textbox.value = String(this.textboxElem?.value || ""); // make the value stay
		this.textboxElem = textbox;

		return textbox;
	};

	uikitVerticalLine = (x: number, y: number, height: number) => {
		const line = document.createElement("div");
		line.className = "uikitVerticalLine";

		line.id = String(window.renderID++);
		line.style.cssText = `left: ${x}px; top: ${y}px; height: ${height}px;`;

		this.#window.body.appendChild(line);

		if (line == null)
			throw new UIError("uikit element has disappeared in processing");

		return line;
	};

	uikitHorizontalLine = (x: number, y: number, width: number) => {
		const line = document.createElement("div");
		line.className = "uikitHorizontalLine";

		line.id = String(window.renderID++);
		line.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px;`;

		this.#window.body.appendChild(line);

		if (line == null)
			throw new UIError("uikit element has disappeared in processing");

		return line;
	};

	uikitProgressBar = (
		x: number,
		y: number,
		width: number,
		height: number,
		progress: number | "throb"
	) => {
		const bar = document.createElement("div");
		bar.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
		bar.id = String(window.renderID++);
		bar.className = "uikitProgressBar";

		const progressor = document.createElement("div");

		progressor.style.width = progress + "%";

		progressor.id = String(window.renderID++);
		progressor.className = "uikitProgressBarInner";

		bar.innerHTML = progressor.outerHTML;

		this.#window.body.appendChild(bar);

		if (bar == null)
			throw new UIError("uikit element has disappeared in processing");

		return bar;
	};

	uikitTextarea = (
		x: number = 0,
		y: number = 0,
		width: number = 100,
		height: number = 50,
		callbacks: any,
		options = this.#parent.defaultConfig.uikitTextarea
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

		this.#window.body.appendChild(area);

		if (area == null)
			throw new UIError("uikit element has disappeared in processing");

		if (focus == this.#window.winID) area.focus();

		area.value = String(this.textboxElem?.value || ""); // make the value stay
		this.textboxElem = area;

		return area;
	};

	uikitBox = (
		x: number = 0,
		y: number = 100,
		width: number = 100,
		height: number = 100,
		config?: uikitBoxConfig
	) => {
		const box = document.createElement("div");
		box.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px; background: ${config?.background || "var(--main-theme-tertiary)"}; border-radius: ${config?.borderRadius}px;`;
		box.id = String(window.renderID++);
		box.className = "uikitBox";

		this.#window.body.appendChild(box);

		if (box == null)
			throw new UIError("uikit element has disappeared in processing");

		return box;
	};
	uikitCanvas2D = (
		x: number,
		y: number,
		width: number,
		height: number,
		renderingSteps: canvasRenderingStep[],
		options: uikitCanvasOptions
	) => {
		const canvas = document.createElement("canvas");
		canvas.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
		canvas.width = width;
		canvas.height = height;
		canvas.id = String(window.renderID++);
		canvas.className = "uikitCanvas";

		this.#window.body.append(canvas);

		const ctx = canvas.getContext("2d");

		if (ctx == null) throw new Error("canvas ctx is null");

		for (const st of renderingSteps) {
			const d = st.data;

			const start = performance.now();

			switch (st.type) {
				case "line":
					const start = d.start;
					const mids = d.mids;
					const end = d.end;

					ctx.strokeStyle = d.colour;

					ctx.beginPath();
					ctx.moveTo(start.x, start.y);

					for (const i in mids) {
						ctx.lineTo(mids[i].x, mids[i].y);
					}

					ctx.lineTo(end.x, end.y);
					ctx.stroke();

					break;
				case "rectangle":
					const pos1: canvasPosition = d.position1;
					const pos2: canvasPosition = d.position2;

					const width = Math.abs(pos2.x - pos1.x);
					const height = Math.abs(pos2.y - pos1.y);

					const anchor: canvasPosition = {
						x: Math.min(pos1.x, pos2.x),
						y: Math.min(pos1.y, pos2.y)
					};

					ctx.fillStyle = d.backgroundColour;
					ctx.strokeStyle = d.borderColour;

					ctx.fillRect(anchor.x, anchor.y, width, height);
					ctx.strokeRect(anchor.x, anchor.y, width, height);

					break;
				case "image": {
					const url = d.url;

					function getDataUriKey(uri: string): string {
						if (dataUriKeyMap[uri]) return dataUriKeyMap[uri];
						const key = `d${dataUriCounter++}`;
						dataUriKeyMap[uri] = key;
						return key;
					}

					const key = getDataUriKey(url);

					let image;
					if (imageCache[key] == undefined) {
						image = new Image();
						image.src = dataUriToBlobUrl(d.url);
						imageCache[key] = image;
					} else {
						image = imageCache[key];
					}

					// @ts-expect-error // doesn't understand, mere program.
					ctx.drawImage(image, ...d.args);

					break;
				}
			}

			uiKitTimestamp(`uikitCanvas2D ${st.type} update`, start);
		}

		return canvas;
	};
}

const imageCache: Record<string, HTMLImageElement> = {};
const dataUriKeyMap: Record<string, string> = {};
let dataUriCounter = 0;

// @ts-expect-error
window.imageCache = imageCache;
