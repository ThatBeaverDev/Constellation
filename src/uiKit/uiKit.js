import { newWindow } from "../windows.js";
import "./favicon.js";
import { getIcon } from "../lib/lucide.js";

export async function init() {
	const styles = await (await fetch("/src/uiKit/styles.css")).text();

	const style = document.createElement("style");
	style.textContent = styles;

	document.body.appendChild(style);
}

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

	creators = {
		uikitIcon: (x = 0, y = 0, name = "circle-help") => {
			const icon = getIcon(name);

			icon.id = window.renderID++;
			icon.style.cssText = `left: ${x}px; top: ${y}px`;

			return icon;
		},

		uikitText: (x = 0, y = 0, string = "Lorum Ipsum") => {
			const text = document.createElement("p");
			text.className = "uikitText";

			text.id = window.renderID++;
			text.innerText = string;
			text.style.cssText = `left: ${x}px; top: ${y}px`;

			return text;
		}
	};

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

		this.displayedSteps = [];

		for (const i in this.items) {
			this.items[i].remove();
			this.items.splice(i, 1);
		}
		this.window.body.innerHTML = "";

		for (const item of this.steps) {
			this.displayedSteps.push(structuredClone(item));

			const creator = this.creators[item.type];
			if (creator == undefined) {
				throw new Error("Creator is not defined for uikit Type " + item.type);
			}

			const elem = creator(...item.args);
			elem.id = window.renderID++;

			this.window.body.appendChild(elem);

			this.items.push(document.getElementById(elem.id));
		}
	};
}
