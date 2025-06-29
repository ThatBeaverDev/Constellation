import { focus, newWindow, Window } from "../../windows.js";
import "./favicon.js";
import { getIcon } from "../lucide.js";
import { getTextWidth } from "./calcWidth.js";
import { Process } from "../../apps/executables.js";
import { UIError } from "../../errors.js";

export const font = "Arial";

export async function init() {
	const styles = await (await fetch("/src/lib/uiKit/styles.css")).text();

	const style = document.createElement("style");
	style.textContent = styles;

	document.body.appendChild(style);
}

type uikitCreatorName = keyof Renderer["creators"];
interface step {
	type: uikitCreatorName;
	args: any[];
}

interface textboxCallbackObject {}

export class Renderer {
	constructor(process: Process) {
		this.process = process;

		// @ts-ignore
		this.window = newWindow(this.process.directory, process).data!;
	}

	private process: Process;
	window: Window;

	clear = () => {
		this.textboxExists = false;
		this.steps = [];
	};

	private steps: step[] = [];
	private displayedSteps: step[] = [];
	private textboxExists: Boolean = false;
	textBoxValue: string = "";

	icon = (x: number = 0, y: number = 0, name: string = "circle-help") => {
		const obj: step = {
			type: "uikitIcon",
			args: [x, y, name]
		};
		this.steps.push(obj);
	};

	text = (x: number, y: number, string: string, size: number = 15) => {
		const obj: step = {
			type: "uikitText",
			args: [x, y, string, size]
		};
		this.steps.push(obj);
	};
	button = (x: number, y: number, string: string, leftClickCallback: Function, rightClickCallback: Function, size: number = 15) => {
		const obj: step = {
			type: "uikitButton",
			args: [x, y, string, leftClickCallback, rightClickCallback, size]
		};
		this.steps.push(obj);
	};
	textbox = (x: number, y: number, backtext: string, callbacks: textboxCallbackObject, options = this.defaultConfig.uikitTextbox) => {
		if (this.textboxExists == true) {
			throw new UIError("UI cannot have more than one textbox.");
		}

		this.textboxExists = true;

		const opts = {};

		for (const i in this.defaultConfig.uikitTextbox) {
			// @ts-ignore
			opts[i] = options[i] ?? this.defaultConfig.uikitTextbox[i];
		}

		const obj: step = {
			type: "uikitTextbox",
			args: [x, y, backtext, callbacks, opts]
		};
		this.steps.push(obj);
	};

	verticalLine = (x: number, y: number, height: number) => {
		const obj: step = {
			type: "uikitVerticalLine",
			args: [x, y, height]
		};
		this.steps.push(obj);
	};

	horizontalLine = (x: number, y: number, width: number) => {
		const obj: step = {
			type: "uikitHorizontalLine",
			args: [x, y, width]
		};
		this.steps.push(obj);
	};

	table = (x: number, y: number, items: any) => {
		const obj: step = {
			type: "uikitTable",
			args: [x, y, items]
		};
		this.steps.push(obj);
	};

	progressBar = (x: number, y: number, width: number, height: number, progress: number | "throb") => {
		const obj: step = {
			type: "uikitProgressBar",
			args: [x, y, width, height, progress]
		};
		this.steps.push(obj);
	};

	textarea = (
		x: number,
		y: number,
		width: number,
		height: number,
		callbacks = {
			edit: () => {},
			keypresss: () => {}
		}
	) => {
		if (this.textboxExists == true) {
			throw new UIError("UI cannot have more than one textbox.");
		}

		this.textboxExists = true;

		const obj: step = {
			type: "uikitTextarea",
			args: [x, y, width, height, callbacks]
		};
		this.steps.push(obj);
	};

	getTextWidth = getTextWidth;
	setWindowIcon = (name: string) => {
		const icon = getIcon(name);
		this.window.setIcon(icon);
	};

	defaultConfig = {
		uikitTextbox: {
			isInvisible: false,
			isEmpty: false
		}
	};

	private textboxElem: HTMLInputElement | undefined;
	private textboxValue: string = "";
	private creators = {
		uikitIcon: (x = 0, y = 0, name = "circle-help") => {
			const icon = getIcon(name);

			icon.id = String(window.renderID++);
			icon.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(icon);
			const live = document.getElementById(icon.id);

			return live;
		},

		uikitText: (x = 0, y = 0, string = "Lorum Ipsum", size: number) => {
			const text = document.createElement("p");
			text.className = "uikitText";

			text.id = String(window.renderID++);
			text.innerText = string;
			text.style.cssText = `left: ${x}px; top: ${y}px; font-size: ${size}px;`;

			this.window.body.appendChild(text);
			const live = document.getElementById(text.id);

			return live;
		},

		uikitButton: (x = 0, y = 0, string = "Lorum Ipsum", leftClickCallback = () => {}, rightClickCallback = () => {}, size: number) => {
			const button = document.createElement("button");
			button.className = "uikitButton";

			button.id = String(window.renderID++);
			button.innerText = string;
			button.style.cssText = `left: ${x}px; top: ${y}px; font-size: ${size}px;`;

			this.window.body.appendChild(button);
			// @ts-ignore // query selector doesn't work for this since we have numbers in the ID
			const live: HTMLButtonElement = document.getElementById(button.id)!;

			live.addEventListener(
				"mousedown",
				(event) => {
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
				{ signal: this.signal }
			);

			return live;
		},

		uikitTextbox: (
			x = 0,
			y = 0,
			backtext = "Lorum Ipsum",
			callbacks = {
				update: (key: string, value: string) => {},
				enter: (value: string) => {}
			},
			options = this.defaultConfig.uikitTextbox
		) => {
			const textbox = document.createElement("input");
			textbox.type = "text";
			textbox.classList.add("uikitTextbox");

			if (options.isInvisible) textbox.classList.add("uikitTextboxInvisible");

			textbox.id = String(window.renderID++);
			textbox.placeholder = backtext;
			textbox.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(textbox);
			// @ts-expect-error
			const live: HTMLInputElement = document.getElementById(textbox.id);

			live.addEventListener(
				"keydown",
				(event) => {
					const val = String(live.value);
					if (event.code == "Enter") {
						callbacks.enter(val);
					} else {
						callbacks.update(event.key, val);
					}
				},
				{ signal: this.signal }
			);

			if (focus == this.window.winID) live.focus();

			if (options.isEmpty == false) textbox.value = String(this.textboxElem?.value || ""); // make the value stay
			this.textboxElem = live;

			return live;
		},

		uikitVerticalLine: (x: number, y: number, height: number) => {
			const line = document.createElement("div");
			line.className = "uikitVerticalLine";

			line.id = String(window.renderID++);
			line.style.cssText = `left: ${x}px; top: ${y}px; height: ${height}px;`;

			this.window.body.appendChild(line);
			const live = document.getElementById(line.id);

			return live;
		},

		uikitHorizontalLine: (x: number, y: number, width: number) => {
			const line = document.createElement("div");
			line.className = "uikitHorizontalLine";

			line.id = String(window.renderID++);
			line.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px;`;

			this.window.body.appendChild(line);
			const live = document.getElementById(line.id);

			return live;
		},

		uikitTable: () => {},

		uikitProgressBar: (x: number, y: number, width: number, height: number, progress: number | "throb") => {
			const bar = document.createElement("div");
			bar.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
			bar.id = String(window.renderID++);
			bar.className = "uikitProgressBar";

			const progressor = document.createElement("div");

			progressor.style.width = progress + "%";

			progressor.id = String(window.renderID++);
			progressor.className = "uikitProgressBarInner";

			bar.innerHTML = progressor.outerHTML;

			this.window.body.appendChild(bar);
			const live = document.getElementById(bar.id);

			return live;
		},

		uikitTextarea: (x: number = 0, y: number = 0, width: number = 100, height: number = 50) => {
			const area = document.createElement("textarea");
			area.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
			area.id = String(window.renderID++);
			area.className = "uikitTextarea";

			this.window.body.appendChild(area);
			// @ts-expect-error
			const live: HTMLTextAreaElement = document.getElementById(area.id);

			if (focus == this.window.winID) live.focus();

			return live;
		}
	};

	private controller = new AbortController();
	private signal = this.controller.signal;

	windowWidth: number = 0;
	windowHeight: number = 0;

	private items: any[] = [];
	commit = () => {
		this.windowWidth = this.window.container.clientWidth;
		this.windowWidth = this.window.container.clientHeight;

		// don't render if the content is the same
		if (this.steps.length == this.displayedSteps.length) {
			const steps = JSON.stringify(this.steps);
			const displayedSteps = JSON.stringify(this.displayedSteps);
			if (steps == displayedSteps) {
				return;
			}
		}

		this.controller.abort();

		this.controller = new AbortController();
		this.signal = this.controller.signal;

		this.displayedSteps = [];

		for (const i in this.items) {
			const item = this.items[i];

			// just incase
			if (item !== null) {
				item.remove();
			}
			// @ts-ignore
			this.items.splice(i, 1);
		}

		this.window.body.innerHTML = "";

		for (const item of this.steps) {
			this.displayedSteps.push(item);

			const creator = this.creators[item.type];
			if (creator == undefined) {
				throw new UIError("Creator is not defined for uikit Type " + item.type);
			}

			// @ts-ignore (it dislikes the destructuring operation on item.args, no idea how to fix it.)
			const live = creator(...item.args)!;

			this.items.push(live);
		}
	};
}
