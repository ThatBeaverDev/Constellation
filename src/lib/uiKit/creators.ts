import { UIError } from "../../errors.js";
import { GraphicalWindow, focus } from "../../windows/windows.js";
import { getIcon } from "../icons.js";
import {
	canvasRenderingStep,
	step,
	uikitBoxConfig,
	uikitCanvasOptions
} from "./definitions.js";
import { Renderer } from "./uiKit.js";

export default class uiKitCreators {
	#parent: Renderer;
	#window: GraphicalWindow;
	#controller: AbortController;
	#signal: AbortSignal;
	textboxElem: HTMLInputElement | HTMLTextAreaElement | undefined;
	hasTextbox: boolean = false;

	constructor(
		parent: Renderer,
		window: GraphicalWindow,
		controller: AbortController
	) {
		this.#parent = parent;

		this.#window = window;
		this.#controller = controller;
		this.#signal = controller.signal;
	}

	uikitIcon = (x = 0, y = 0, name = "circle-help", scale = 1) => {
		const icon = getIcon(name);
		icon.style.cssText = `left: ${x}px; top: ${y}px; width: ${24 * scale}px; height: ${24 * scale}px;`;

		this.#window.body.appendChild(icon);
		const live = document.getElementById(icon.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		return live;
	};

	uikitText = (x = 0, y = 0, string = "", size: number) => {
		const text = document.createElement("p");
		text.className = "uikitText";

		text.id = String(window.renderID++);
		text.innerText = string;
		text.style.cssText = `left: ${x}px; top: ${y}px; font-size: ${size}px;`;

		this.#window.body.appendChild(text);
		const live = document.getElementById(text.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		return live;
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
		// @ts-ignore // query selector doesn't work for this since we have numbers in the ID
		const live: HTMLButtonElement = document.getElementById(button.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		live.addEventListener(
			"pointerdown",
			(event: MouseEvent) => {
				event.preventDefault();
				switch (event.button) {
					case 0:
						// left click
						leftClickCallback();
						break;
					case 1:
						// middle click
						// unused
						break;
					case 2:
						// right click
						rightClickCallback();
						break;
				}
			},
			{
				signal: this.#signal
			}
		);

		return live;
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
		// @ts-expect-error
		const live: HTMLInputElement = document.getElementById(textbox.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		live.addEventListener(
			"keydown",
			(event) =>
				setTimeout(() => {
					const val = String(live.value);
					if (event.code == "Enter") {
						if (typeof callbacks.enter !== "function") return;

						callbacks.enter(val);
					} else {
						if (typeof callbacks.update !== "function") return;

						callbacks.update(event.key, val);
					}
				}, 2),
			{ signal: this.#signal }
		);

		if (options.isEmpty == false)
			textbox.value = String(this.textboxElem?.value || ""); // make the value stay
		this.textboxElem = live;

		return live;
	};

	uikitVerticalLine = (x: number, y: number, height: number) => {
		const line = document.createElement("div");
		line.className = "uikitVerticalLine";

		line.id = String(window.renderID++);
		line.style.cssText = `left: ${x}px; top: ${y}px; height: ${height}px;`;

		this.#window.body.appendChild(line);
		const live = document.getElementById(line.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		return live;
	};

	uikitHorizontalLine = (x: number, y: number, width: number) => {
		const line = document.createElement("div");
		line.className = "uikitHorizontalLine";

		line.id = String(window.renderID++);
		line.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px;`;

		this.#window.body.appendChild(line);
		const live = document.getElementById(line.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		return live;
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
		const live = document.getElementById(bar.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		return live;
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
		// @ts-expect-error
		const live: HTMLTextAreaElement = document.getElementById(area.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		live.addEventListener(
			"keydown",
			(event) => {
				const val = String(live.value);

				if (event.code == "Enter") {
					if (typeof callbacks.enter !== "function") return;

					callbacks.enter(val);
				} else {
					if (typeof callbacks.update !== "function") return;

					callbacks.update(event.key, val);
				}
			},
			{ signal: this.#signal }
		);

		if (focus == this.#window.winID) live.focus();

		area.value = String(this.textboxElem?.value || ""); // make the value stay
		this.textboxElem = live;

		return live;
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
		const live = document.getElementById(box.id);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		return live;
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
		canvas.id = String(window.renderID++);
		canvas.className = "uikitCanvas";

		this.#window.body.append(canvas);
		const live: HTMLCanvasElement | null = document.querySelector(
			"canvas.uikitCanvas#" + canvas.id
		);

		if (live == null)
			throw new UIError("uikit element has disappeared in processing");

		const ctx = live.getContext("2d");

		if (ctx == null) throw new Error("canvas ctx is null");

		for (const st of renderingSteps) {
			const d = st.data;

			switch (st.type) {
				case "line":
					const start = d.start;
					const mids = d.mids;
					const end = d.end;

					ctx.beginPath();
					ctx.moveTo(start.x, start.y);

					for (const i in mids) {
						ctx.lineTo(mids[i].x, mids[i].y);
					}

					ctx.lineTo(end.x, end.y);
					ctx.stroke();

					break;
			}
		}

		return live;
	};
}
