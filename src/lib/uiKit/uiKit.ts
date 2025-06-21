import { newWindow, Window } from "../../windows.js";
import "./favicon.js";
import { getIcon } from "../lucide.js";
import { getTextWidth } from "./calcWidth.js";
import { Process } from "../../apps/processes.js";

export const font = "Arial";

export async function init() {
	const styles = await (await fetch("/src/lib/uiKit/styles.css")).text();

	const style = document.createElement("style");
	style.textContent = styles;

	document.body.appendChild(style);
}

let lastContextTimestamp = 0;
window.oncontextmenu = (e) => {
	const since = Date.now() - lastContextTimestamp;
	if (since > 500) {
		lastContextTimestamp = Date.now();
		e.preventDefault();
	}
};

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

	process: Process;
	window: Window;

	clear = () => {
		this.steps = [];
	};

	steps: step[] = [];
	displayedSteps: step[] = [];

	icon = (x: number = 0, y: number = 0, name: string = "circle-help") => {
		const obj: step = {
			type: "uikitIcon",
			args: [x, y, name]
		};
		this.steps.push(obj);
	};

	text = (x: number, y: number, string: string) => {
		const obj: step = {
			type: "uikitText",
			args: [x, y, string]
		};
		this.steps.push(obj);
	};
	button = (x: number, y: number, string: string, leftClickCallback: Function, rightClickCallback: Function) => {
		const obj: step = {
			type: "uikitButton",
			args: [x, y, string, leftClickCallback, rightClickCallback]
		};
		this.steps.push(obj);
	};
	textbox = (x: number, y: number, backtext: string, callbacks: textboxCallbackObject) => {
		const obj: step = {
			type: "uikitTextbox",
			args: [x, y, backtext, callbacks]
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

	getTextWidth = getTextWidth;

	creators = {
		uikitIcon: (x = 0, y = 0, name = "circle-help") => {
			const icon = getIcon(name);

			icon.id = String(window.renderID++);
			icon.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(icon);
			const live = document.getElementById(icon.id);

			return live;
		},

		uikitText: (x = 0, y = 0, string = "Lorum Ipsum") => {
			const text = document.createElement("p");
			text.className = "uikitText";

			text.id = String(window.renderID++);
			text.innerText = string;
			text.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(text);
			const live = document.getElementById(text.id);

			return live;
		},

		uikitButton: (
			x = 0,
			y = 0,
			string = "Lorum Ipsum",
			leftClickCallback = () => {},
			rightClickCallback = () => {}
		) => {
			const button = document.createElement("button");
			button.className = "uikitButton";

			button.id = String(window.renderID++);
			button.innerText = string;
			button.style.cssText = `left: ${x}px; top: ${y}px;`;

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
			}
		) => {
			const textbox = document.createElement("input");
			textbox.type = "text";
			textbox.className = "uikitTextbox";

			textbox.id = String(window.renderID++);
			textbox.placeholder = backtext;
			textbox.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(textbox);
			// @ts-ignore // query selector doesn't work for this since we have numbers in the ID
			const live: HTMLInputElement = document.getElementById(textbox.id)!;

			live.addEventListener(
				"keyup",
				(event) => {
					if (event.code == "Enter") {
						callbacks.enter(live.value);
					} else {
						callbacks.update(event.key, live.value);
					}
				},
				{ signal: this.signal }
			);

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

		uikitTable: () => {}
	};

	controller = new AbortController();
	signal = this.controller.signal;

	items: any[] = [];
	commit = () => {
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
			this.items[i].remove();
			// @ts-ignore
			this.items.splice(i, 1);
		}
		this.window.body.innerHTML = "";

		for (const item of this.steps) {
			this.displayedSteps.push(item);

			const creator = this.creators[item.type];
			if (creator == undefined) {
				throw new Error("Creator is not defined for uikit Type " + item.type);
			}

			// @ts-ignore (it dislikes the destructuring operation on item.args, no idea how to fix it.)
			const live = creator(...item.args);

			this.items.push(live);
		}
	};
}
