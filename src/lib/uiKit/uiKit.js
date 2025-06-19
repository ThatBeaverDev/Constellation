import { newWindow } from "../../windows.js";
import "./favicon.js";
import { getIcon } from "../lucide.js";
import { getTextWidth } from "./calcWidth.js";

export const font = "Arial";

export async function init() {
	const styles = await (await fetch("/build/lib/uiKit/styles.css")).text();

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

export class Renderer {
	constructor(process) {
		this.process = process;

		this.window = newWindow(this.process.directory).data;

		this.window.buttons.close.addEventListener("click", async (event) => {
			await this.process.terminate();
			this.window.remove();
		});
	}

	clear = () => {
		this.steps = [];
	};

	steps = [];
	displayedSteps = [];

	icon = (x = 0, y = 0, name = "circle-help") => {
		this.steps.push({
			type: "uikitIcon",
			args: [x, y, name]
		});
	};

	text = (x, y, string) => {
		this.steps.push({
			type: "uikitText",
			args: [x, y, string]
		});
	};
	button = (x, y, string, leftClickCallback, rightClickCallback) => {
		this.steps.push({
			type: "uikitButton",
			args: [x, y, string, leftClickCallback, rightClickCallback]
		});
	};
	textbox = (x, y, backtext, callbacks) => {
		this.steps.push({
			type: "uikitTextbox",
			args: [x, y, backtext, callbacks]
		});
	};

	verticalLine = (x, y, height) => {
		this.steps.push({
			type: "uikitVerticalLine",
			args: [x, y, height]
		});
	};

	horizontalLine = (x, y, width) => {
		this.steps.push({
			type: "uikitHorizontalLine",
			args: [x, y, width]
		});
	};

	table = (x, y, items) => {
		this.steps.push({
			type: "uikitTable",
			args: [x, y, items]
		});
	};

	getTextWidth = getTextWidth;

	creators = {
		uikitIcon: (x = 0, y = 0, name = "circle-help") => {
			const icon = getIcon(name).cloneNode();

			icon.id = window.renderID++;
			icon.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(icon);
			const live = document.getElementById(icon.id);

			return live;
		},

		uikitText: (x = 0, y = 0, string = "Lorum Ipsum") => {
			const text = document.createElement("p");
			text.className = "uikitText";

			text.id = window.renderID++;
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

			button.id = window.renderID++;
			button.innerText = string;
			button.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(button);
			const live = document.getElementById(button.id);

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
				update: () => {},
				enter: () => {}
			}
		) => {
			const textbox = document.createElement("input");
			textbox.type = "text";
			textbox.className = "uikitTextbox";

			textbox.id = window.renderID++;
			textbox.placeholder = backtext;
			textbox.style.cssText = `left: ${x}px; top: ${y}px;`;

			this.window.body.appendChild(textbox);
			const live = document.getElementById(textbox.id);

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

		uikitVerticalLine: (x, y, height) => {
			const line = document.createElement("div");
			line.className = "uikitVerticalLine";

			line.id = window.renderID++;
			line.style.cssText = `left: ${x}px; top: ${y}px; height: ${height}px;`;

			this.window.body.appendChild(line);
			const live = document.getElementById(line.id);

			return live;
		},

		uikitHorizontalLine: (x, y, width) => {
			const line = document.createElement("div");
			line.className = "uikitHorizontalLine";

			line.id = window.renderID++;
			line.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px;`;

			this.window.body.appendChild(line);
			const live = document.getElementById(line.id);

			return live;
		}
	};

	controller = new AbortController();
	signal = this.controller.signal;

	items = [];
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
			this.items.splice(i, 1);
		}
		this.window.body.innerHTML = "";

		for (const item of this.steps) {
			this.displayedSteps.push(item);

			const creator = this.creators[item.type];
			if (creator == undefined) {
				throw new Error("Creator is not defined for uikit Type " + item.type);
			}

			const live = creator(...item.args);

			this.items.push(live);
		}
	};
}
