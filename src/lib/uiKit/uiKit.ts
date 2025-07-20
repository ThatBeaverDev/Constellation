import { focus, newWindow, Window } from "../../windows/windows.js";
import { getIcon } from "../icons.js";
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
type uiKitCreators = Record<string, (...args: any[]) => HTMLElement>;
interface step {
	type: uikitCreatorName;
	args: any[];
	onClick?: {
		left?: Function;
		right?: Function;
	};
}

interface textboxCallbackObject {}

type uikitTextboxConfig = {
	isInvisible?: boolean;
	isEmpty?: boolean;
	fontSize?: number;
	disableMobileAutocorrect: boolean;
};
type uikitTextareaConfig = {
	isInvisible?: boolean;
	isEmpty?: boolean;
	disableMobileAutocorrect: boolean;
};
type uikitBoxConfig = {
	borderRadius?: number | string;
	colour?: string; // colour but typescript is stupid and doesn't know rgb(255, 255, 255) is a colour 🤦
};

let lastClick: number = 0;
function onClick() {
	lastClick = Date.now();
}
document.addEventListener("mousedown", onClick);
document.addEventListener("pointerdown", onClick);

// class
export class Renderer {
	defaultConfig = {
		uikitTextbox: {
			isInvisible: false,
			isEmpty: false,
			fontSize: undefined,
			disableMobileAutocorrect: false
		},
		uikitTextarea: {
			isInvisible: false,
			isEmpty: false,
			disableMobileAutocorrect: false
		},
		uikitBox: {
			borderRadius: 5,
			colour: "rgb(255, 255, 255)"
		}
	};

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

	elemID: number = 0;

	readonly icon = (
		x: number = 0,
		y: number = 0,
		name: string = "circle-help",
		scale: number = 1
	) => {
		const obj: step = {
			type: "uikitIcon",
			args: [x, y, name, scale]
		};
		return this.steps.push(obj);
	};

	readonly text = (
		x: number,
		y: number,
		string: string,
		size: number = 15
	) => {
		const obj: step = {
			type: "uikitText",
			args: [x, y, string, size]
		};
		return this.steps.push(obj);
	};
	readonly button = (
		x: number,
		y: number,
		string: string,
		leftClickCallback: Function = () => {},
		rightClickCallback: Function = () => {},
		size: number = 15
	) => {
		const obj: step = {
			type: "uikitButton",
			args: [x, y, string, leftClickCallback, rightClickCallback, size]
		};
		return this.steps.push(obj);
	};
	readonly textbox = (
		x: number,
		y: number,
		width: number = 200,
		height: number = 20,
		backtext: string,
		callbacks: textboxCallbackObject,
		options: uikitTextboxConfig = this.defaultConfig.uikitTextbox
	) => {
		if (this.textboxExists == true) {
			throw new UIError("UI cannot have more than one textbox.");
		}

		// mark the textbox as present to prevent another from being created
		this.textboxExists = true;

		// insure all values are met. if not, apply the default
		const opts = {};
		for (const i in this.defaultConfig.uikitTextbox) {
			// @ts-ignore
			opts[i] = options[i] ?? this.defaultConfig.uikitTextbox[i];
		}

		const obj: step = {
			type: "uikitTextbox",
			args: [x, y, width, height, backtext, callbacks, opts]
		};
		return this.steps.push(obj);
	};

	readonly verticalLine = (x: number, y: number, height: number) => {
		const obj: step = {
			type: "uikitVerticalLine",
			args: [x, y, height]
		};
		return this.steps.push(obj);
	};

	readonly horizontalLine = (x: number, y: number, width: number) => {
		const obj: step = {
			type: "uikitHorizontalLine",
			args: [x, y, width]
		};
		return this.steps.push(obj);
	};

	readonly progressBar = (
		x: number,
		y: number,
		width: number,
		height: number,
		progress: number | "throb"
	) => {
		const obj: step = {
			type: "uikitProgressBar",
			args: [x, y, width, height, progress]
		};
		return this.steps.push(obj);
	};

	readonly textarea = (
		x: number,
		y: number,
		width: number,
		height: number,
		callbacks: textboxCallbackObject,
		options: uikitTextareaConfig = this.defaultConfig.uikitTextarea
	) => {
		if (this.textboxExists == true) {
			throw new UIError("UI cannot have more than one textbox.");
		}

		this.textboxExists = true;

		const obj: step = {
			type: "uikitTextarea",
			args: [x, y, width, height, callbacks, options]
		};
		return this.steps.push(obj);
	};

	readonly box = (
		x: number,
		y: number,
		width: number,
		height: number,
		config: uikitBoxConfig
	) => {
		const obj: step = {
			type: "uikitBox",
			args: [x, y, width, height, config]
		};
		return this.steps.push(obj);
	};

	onClick(
		elemID: number,
		leftClickCallback?: Function,
		rightClickCallback?: Function
	) {
		const left =
			leftClickCallback == undefined
				? undefined
				: leftClickCallback.bind(this.process);
		const right =
			rightClickCallback == undefined
				? undefined
				: rightClickCallback.bind(this.process);

		// insure elemID is valid
		if (elemID > 0 && elemID <= this.steps.length) {
			this.steps[elemID - 1].onClick = { left, right };
		} else {
			throw new UIError(`onClick called with invalid elemID: ${elemID}`);
		}
	}

	async awaitClick(callback: () => void | Promise<void>) {
		const init = Date.now();

		await new Promise((resolve: Function) => {
			let interval = setInterval(() => {
				if (lastClick > init) {
					clearInterval(interval);
					resolve();
					return;
				}
			});
		});

		callback();
	}

	readonly getTextWidth = getTextWidth;
	readonly setWindowIcon = (name: string) => {
		this.window.setIcon(name);
	};

	readonly setTextboxContent = (content: string) => {
		// insure there is actually a textbox
		if (this.textboxElem !== undefined) {
			// set the value
			this.textboxElem.value = content;
		}
	};

	readonly getTextboxContent = () => {
		// insure there is actually a textbox
		if (this.textboxElem !== undefined) {
			// return the value
			return this.textboxElem.value;
		}

		// return null otherwise
		return null;
	};

	private textboxElem: HTMLInputElement | HTMLTextAreaElement | undefined;
	private readonly creators: uiKitCreators = {
		uikitIcon: (x = 0, y = 0, name = "circle-help", scale = 1) => {
			const icon = getIcon(name);
			icon.style.cssText = `left: ${x}px; top: ${y}px; width: ${24 * scale}px; height: ${24 * scale}px;`;

			this.window.body.appendChild(icon);
			const live = document.getElementById(icon.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

			return live;
		},

		uikitText: (x = 0, y = 0, string = "", size: number) => {
			const text = document.createElement("p");
			text.className = "uikitText";

			text.id = String(window.renderID++);
			text.innerText = string;
			text.style.cssText = `left: ${x}px; top: ${y}px; font-size: ${size}px;`;

			this.window.body.appendChild(text);
			const live = document.getElementById(text.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

			return live;
		},

		uikitButton: (
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

			this.window.body.appendChild(button);
			// @ts-ignore // query selector doesn't work for this since we have numbers in the ID
			const live: HTMLButtonElement = document.getElementById(button.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

			function mouseDown(event: MouseEvent) {
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
			}

			live.addEventListener("mousedown", mouseDown, {
				signal: this.signal
			});
			live.addEventListener("pointerdown", mouseDown, {
				signal: this.signal
			});

			return live;
		},

		uikitTextbox: (
			x = 0,
			y = 0,
			width = 200,
			height = 20,
			backtext = "",
			callbacks = {
				update: (key: string, value: string) => {},
				enter: (value: string) => {}
			},
			options = this.defaultConfig.uikitTextbox
		) => {
			const textbox = document.createElement("input");
			textbox.type = "text";
			textbox.inputMode = "text";
			textbox.classList.add("uikitTextbox");

			if (options.isInvisible)
				textbox.classList.add("uikitTextboxInvisible");
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

			this.window.body.appendChild(textbox);
			// @ts-expect-error
			const live: HTMLInputElement = document.getElementById(textbox.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

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
				{ signal: this.signal }
			);

			if (options.isEmpty == false)
				textbox.value = String(this.textboxElem?.value || ""); // make the value stay
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

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

			return live;
		},

		uikitHorizontalLine: (x: number, y: number, width: number) => {
			const line = document.createElement("div");
			line.className = "uikitHorizontalLine";

			line.id = String(window.renderID++);
			line.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px;`;

			this.window.body.appendChild(line);
			const live = document.getElementById(line.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

			return live;
		},

		uikitProgressBar: (
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

			this.window.body.appendChild(bar);
			const live = document.getElementById(bar.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

			return live;
		},

		uikitTextarea: (
			x: number = 0,
			y: number = 0,
			width: number = 100,
			height: number = 50,
			callbacks: any,
			options = this.defaultConfig.uikitTextarea
		) => {
			const area = document.createElement("textarea");
			area.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
			area.id = String(window.renderID++);
			area.inputMode = "text";
			area.className = "uikitTextarea";

			if (options.isInvisible)
				area.classList.add("uikitTextboxInvisible");
			if (options.disableMobileAutocorrect) {
				area.autocomplete = "off";
				area.autocapitalize = "off";
				area.spellcheck = false;
			}

			this.window.body.appendChild(area);
			// @ts-expect-error
			const live: HTMLTextAreaElement = document.getElementById(area.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

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
				{ signal: this.signal }
			);

			if (focus == this.window.winID) live.focus();

			area.value = String(this.textboxElem?.value || ""); // make the value stay
			this.textboxElem = live;

			return live;
		},

		uikitBox: (
			x: number = 0,
			y: number = 100,
			width: number = 100,
			height: number = 100,
			config: uikitBoxConfig
		) => {
			const box = document.createElement("div");
			box.style.cssText = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px; background-color: ${config.colour}; border-radius: ${config.borderRadius}px;`;
			box.id = String(window.renderID++);
			box.className = "uikitBox";

			this.window.body.appendChild(box);
			const live = document.getElementById(box.id);

			if (live == null)
				throw new UIError(
					"uikit element has disappeared in processing"
				);

			return live;
		}
	};

	// add abort controller to remove event listeners
	private controller = new AbortController();
	private signal = this.controller.signal;

	windowWidth: number = 0;
	windowHeight: number = 0;

	private items: any[] = [];

	private mustRedraw: boolean = false;
	redraw = () => {
		this.mustRedraw = true;
	};

	private deleteElements() {
		// remove all event listeners
		this.controller.abort();

		// recreate the AbortController so the next set can be bulk removed
		this.controller = new AbortController();
		this.signal = this.controller.signal;

		this.displayedSteps = [];

		// delete all the elements
		for (const i in this.items) {
			const item = this.items[i];

			// just incase
			if (item !== null) {
				item.remove();
			}
			// @ts-ignore
			this.items.splice(i, 1);
		}

		// just make sure everything is gone
		this.window.body.innerHTML = "";
	}

	readonly commit = () => {
		this.windowWidth = this.window.container.clientWidth;
		this.windowHeight = this.window.container.clientHeight;

		if (this.textboxElem !== undefined) {
			if (focus == this.window.winID) this.textboxElem.focus();
		}

		if (!this.mustRedraw) {
			if (this.steps.length === this.displayedSteps.length) {
				const steps = JSON.stringify(this.steps);
				const displayedSteps = JSON.stringify(this.displayedSteps);
				if (steps === displayedSteps) {
					return;
				}
			}
		}
		// prevent infinite redraws
		this.mustRedraw = false;

		// Abort all listeners, but keep the elements unless they are removed
		this.controller.abort();
		this.controller = new AbortController();
		this.signal = this.controller.signal;

		const newItems: HTMLElement[] = [];
		const newDisplayedSteps: typeof this.steps = [];

		for (const i in this.steps) {
			const newStep = this.steps[i];
			const oldStep = this.displayedSteps[i];
			const oldElement = this.items[i];

			let element: HTMLElement;

			const stepChanged =
				!oldStep ||
				oldStep.type !== newStep.type ||
				JSON.stringify(oldStep.args) !== JSON.stringify(newStep.args);

			// inside your commit() loop where you create new elements
			if (stepChanged) {
				if (oldElement) oldElement.remove();

				const creator = this.creators[newStep.type];
				if (!creator) {
					throw new UIError(
						`Creator is not defined for uikit Type ${newStep.type}`
					);
				}

				// Create fresh element
				element = creator(...newStep.args)!;
			} else {
				element = oldElement!;
			}

			// add event listeners to the element
			// the old element had all uiKit event listeners removed by the AbortController
			if (newStep.onClick !== undefined) {
				element.classList.add("clickable");

				function mouseDown(event: MouseEvent) {
					if (!newStep.onClick) return;

					switch (event.button) {
						case 0:
							if (typeof newStep.onClick.left === "function") {
								event.preventDefault();
								newStep.onClick.left(
									event.clientX,
									event.clientY
								);
							}
							break;
					}
				}

				element.addEventListener("mousedown", mouseDown, {
					signal: this.signal
				});
				element.addEventListener("pointerdown", mouseDown, {
					signal: this.signal
				});
				element.addEventListener(
					"contextmenu",
					(event: MouseEvent) => {
						if (!newStep.onClick) return;

						if (typeof newStep.onClick.right === "function") {
							event.preventDefault();
							newStep.onClick.right(event.clientX, event.clientY);
						}
					},
					{ signal: this.signal }
				);
			}

			newItems.push(element);
			newDisplayedSteps.push(newStep);
		}

		// remove missed old elements
		for (let i = this.steps.length; i < this.items.length; i++) {
			const item = this.items[i];
			if (item) item.remove();
		}

		this.items = newItems;
		this.displayedSteps = newDisplayedSteps;

		// reall insure everything is gone
		this.window.body.innerHTML = "";

		// add the new elements
		for (const element of this.items) {
			this.window.body.appendChild(element);
		}
	};

	terminate() {
		this.deleteElements();

		this.window.remove();
	}
}
