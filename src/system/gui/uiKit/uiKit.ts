import { GraphicalWindow } from "../display/windowTypes.js";
import {
	getTextHeight,
	getTextWidth,
	insertNewlines
} from "./components/textUtils.js";
import {
	GuiApplication,
	Process
} from "../../runtime/components/executables.js";
import { UIError } from "../../errors.js";
import { ContextMenu } from "./components/contexts.js";
import uiKitCreators from "./components/creators.js";
import {
	onDragReference,
	onClickOptions,
	step,
	textboxCallbackObject,
	uikitBoxConfig,
	uikitIconOptions,
	uikitTextareaConfig,
	uikitTextboxConfig,
	clickReference,
	ConfigStep
} from "./definitions.js";
import uikitEventCreators from "./components/eventCreators.js";
import uiKitTransitioners from "./components/transitioners.js";
import ConstellationKernel from "../../kernel.js";
import { GraphicalInterface } from "../gui.js";
import {
	UiKitElement,
	UiKitTextboxElement
} from "./components/elementReference.js";
import { UiKitCanvasElement } from "./components/canvas/canvas.js";
import { isArrow } from "../../security/isArrow.js";
import { defaultConfig } from "./components/defaultConfig.js";
import { proxyContext } from "./components/canvas/ctx.js";

// type
export type UiKitRenderer = UiKitRendererClass;

// class
export class UiKitRendererClass {
	#process?: Process;
	#window: GraphicalWindow;

	#index: number = 0;
	readonly #steps: step[] = [];
	#displayedSteps: Partial<step[]> = [];
	#nextDisplayedSteps: step[] = [];

	// add abort controller to remove event listeners
	#controller = new AbortController();
	#signal: AbortSignal = this.#controller.signal;
	#context?: ContextMenu;

	// window stuff
	windowWidth: number = 0;
	windowHeight: number = 0;
	/**
	 * Resizes the application window
	 * @param width - width of the window in pixels
	 * @param height - height of the window in pixels
	 */
	resizeWindow(width: number, height: number) {
		this.#window.resize(width, height);
	}
	windowX: number = 0;
	windowY: number = 0;

	moveWindow(x?: number, y?: number) {
		this.#window.move(x, y);
	}

	set windowName(name: string) {
		this.#window.rename(name);
	}
	get windowName() {
		return this.#window.name;
	}

	get windowShortName() {
		return this.#window.shortname;
	}
	set windowShortName(name: string | undefined) {
		this.#window.shortname = name;
	}

	get displayWidth() {
		const gui = this.#ConstellationKernel.ui;

		if (!(gui.type == "GraphicalInterface"))
			throw new Error("No GUI found");

		return gui.displayWidth;
	}
	get displayHeight() {
		const gui = this.#ConstellationKernel.ui;

		if (!(gui.type == "GraphicalInterface"))
			throw new Error("No GUI found");

		return gui.displayHeight;
	}

	setIcon(name: string) {
		this.#window.setIcon(name);
	}
	makeWindowInvisible() {
		this.#window.hide();
	}
	makeWindowVisible() {
		this.#window.show();
	}
	hideWindowCorners() {
		this.#window.square();
	}
	showWindowCorners() {
		this.#window.unsquare();
	}
	hideWindowHeader() {
		this.#window.hideHeader();
	}
	showWindowHeader() {
		this.#window.showHeader();
	}
	minimiseWindow() {
		this.#window.minimise();
	}
	restoreWindow() {
		this.#window.unminimise();
		this.#window.unfullscreen();
	}
	maximiseWindow() {
		this.#window.fullscreen();
	}

	lastClick: number = 0;

	#ConstellationKernel: ConstellationKernel;

	/**
	 * How much the user has scrolled. Adjusted so that adding it to an element's Y-position makes it scroll naturally.
	 */
	scroll: number = 0;
	/**
	 * The max allowed scroll.
	 */
	furthestScroll: number = Infinity;

	constructor(
		ConstellationKernel: ConstellationKernel,
		process?: GuiApplication,
		window?: GraphicalWindow
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.#process = process;

		const UserInterface = ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface"))
			throw new Error(
				"UIkit requires a graphical environment to function."
			);

		if (window == undefined) {
			let windowName = "Window";
			if (process !== undefined) {
				windowName = process.directory;
			}

			this.#window = UserInterface.windowSystem.newWindow(
				windowName,
				process
			).data;
		} else {
			this.#window = window;
		}

		this.#creators = new uiKitCreators(ConstellationKernel, this.#window);
		this.#eventCreators = new uikitEventCreators(this.#signal);

		this.#transitioners = new uiKitTransitioners();

		document.addEventListener("pointerdown", () => {
			this.lastClick = Date.now();
		});
	}

	clear = () => {
		this.#steps.splice(0, this.#steps.length + 10);
		this.#index = 0;

		// window dimensions
		this.windowWidth = this.#window.body.clientWidth;
		this.windowHeight = this.#window.body.clientHeight;

		// window position
		this.windowX = this.#window.position.left;
		this.windowY = this.#window.position.top;

		this.#nextDisplayedSteps = [];

		// Abort all listeners, but keep the elements unless they are removed
		this.#controller.abort();
		this.#controller = new AbortController();
		this.#signal = this.#controller.signal;
		this.#eventCreators.setSignal(this.#signal);

		this.#window.body.addEventListener(
			"wheel",
			(e) => {
				function clampMin(n: number, min: number) {
					if (n > min) return min;

					return n;
				}

				this.scroll = clampMin(
					this.scroll - e.deltaY,
					this.furthestScroll
				);
			},
			{ signal: this.#signal, passive: false }
		);

		// other window properties
	};

	icon(
		x: number = 0,
		y: number = 0,
		iconName: string = "circle-help",
		iconScale: number = 1,
		colour: string = "",
		options: uikitIconOptions = {}
	) {
		const obj: ConfigStep = {
			type: "uikitIcon",
			args: [x, y, iconName, iconScale, colour, options]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}

	text(
		x: number,
		y: number,
		string: string,
		fontSize: number = 15,
		colour: string = ""
	) {
		const obj: ConfigStep = {
			type: "uikitText",
			args: [x, y, string, fontSize, colour]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}
	button(
		x: number,
		y: number,
		string: string,
		leftClickCallback: Function = () => {},
		rightClickCallback: Function = () => {},
		size: number = 15
	) {
		if (leftClickCallback) isArrow(leftClickCallback, true);
		if (rightClickCallback) isArrow(rightClickCallback, true);

		const obj: ConfigStep = {
			type: "uikitButton",
			args: [x, y, string, leftClickCallback, rightClickCallback, size]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}
	textbox(
		x: number,
		y: number,
		width: number = 200,
		height: number = 20,
		backtext: string,
		callbacks: textboxCallbackObject,
		options: uikitTextboxConfig = defaultConfig.uikitTextbox
	) {
		if (callbacks.update) isArrow(callbacks.update, true);
		if (callbacks.enter) isArrow(callbacks.enter, true);

		// insure all values are met. if not, apply the default
		const opts = {};
		for (const i in defaultConfig.uikitTextbox) {
			// @ts-ignore
			opts[i] =
				// @ts-ignore
				options[i] ?? defaultConfig.uikitTextbox[i];
		}

		const obj: ConfigStep = {
			type: "uikitTextbox",
			args: [x, y, width, height, backtext, callbacks, opts]
		};
		return new UiKitTextboxElement(this, this.#nextStep(obj));
	}

	verticalLine(x: number, y: number, height: number) {
		const obj: ConfigStep = {
			type: "uikitVerticalLine",
			args: [x, y, height]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}

	horizontalLine(x: number, y: number, width: number) {
		const obj: ConfigStep = {
			type: "uikitHorizontalLine",
			args: [x, y, width]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}

	progressBar(
		x: number,
		y: number,
		width: number,
		height: number,
		progress: number | "throb"
	) {
		const obj: ConfigStep = {
			type: "uikitProgressBar",
			args: [x, y, width, height, progress]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}

	textarea(
		x: number,
		y: number,
		width: number,
		height: number,
		callbacks: textboxCallbackObject,
		options: uikitTextareaConfig = defaultConfig.uikitTextarea
	) {
		if (callbacks.enter) isArrow(callbacks.enter, true);
		if (callbacks.update) isArrow(callbacks.update, true);

		const obj: ConfigStep = {
			type: "uikitTextarea",
			args: [x, y, width, height, callbacks, options]
		};

		return new UiKitTextboxElement(this, this.#nextStep(obj));
	}

	box(
		x: number,
		y: number,
		width: number,
		height: number,
		config?: uikitBoxConfig
	) {
		const obj: ConfigStep = {
			type: "uikitBox",
			args: [x, y, width, height, config]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}

	canvas2D(x: number, y: number, width: number, height: number) {
		const obj: ConfigStep = {
			type: "uikitCanvas2D",
			args: [x, y, width, height]
		};

		return new UiKitCanvasElement(this, obj, this.#nextStep(obj));
	}

	embeddedTui(x: number, y: number, width: number, height: number) {
		const obj: ConfigStep = {
			type: "uikitEmbeddedTui",
			args: [x, y, width, height]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}

	iframe(
		x: number,
		y: number,
		width: number,
		height: number,
		URL: string,
		onMessage: (data: any) => Promise<void> | void
	) {
		const obj: ConfigStep = {
			type: "uikitIframe",
			args: [x, y, width, height, URL, onMessage]
		};

		return new UiKitElement(this, this.#nextStep(obj));
	}

	onClick(
		elementID: number | UiKitElement,
		leftClickCallback?: clickReference["left"],
		rightClickCallback?: clickReference["right"],
		otherConfig?: onClickOptions
	) {
		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return;
		const guiScale = UserInterface.displayScaling;

		if (leftClickCallback) isArrow(leftClickCallback, true);
		if (rightClickCallback) isArrow(rightClickCallback, true);

		const elemID = Number(elementID);

		const left =
			leftClickCallback == undefined
				? undefined
				: leftClickCallback.bind(this.#process);
		const right =
			rightClickCallback == undefined
				? undefined
				: rightClickCallback.bind(this.#process);

		const step = this.#steps[elemID - 1];

		// insure elemID is valid
		if (elemID > 0 && elemID <= this.#steps.length && step) {
			// assign data
			const element = step.element;

			element.classList.add("clickable");

			const longPressHoldDuration = 500;

			element.addEventListener(
				"pointerdown",
				(event: PointerEvent) => {
					const start = Date.now();
					event.preventDefault();

					if (event.pointerType == "mouse") {
						// this is handled on mouse UP
						return;
					}

					const hold = () => {
						// remove event listener
						element.removeEventListener("pointerup", release);

						// long press
						if (right) {
							right(
								event.clientX / guiScale,
								event.clientY / guiScale
							);
						}
					};
					const release = () => {
						// remove timeout
						clearTimeout(timeOut);

						// data
						const now = Date.now();
						const duration = now - start;

						// trigger
						if (duration > longPressHoldDuration) {
							// long press
							if (right) {
								right(
									event.clientX / guiScale,
									event.clientY / guiScale
								);
							}
						} else {
							// tap
							if (left) {
								left(
									event.clientX / guiScale,
									event.clientY / guiScale
								);
							}
						}
					};
					const timeOut = setTimeout(hold, longPressHoldDuration);

					element.addEventListener("pointerup", release, {
						once: true
					});
				},
				{ signal: this.#signal }
			);

			element.addEventListener(
				"pointerup",
				(event) => {
					if (event.pointerType == "mouse") {
						// only accept left click
						if (event.button !== 0) return;

						if (left) {
							left(
								event.clientX / guiScale,
								event.clientY / guiScale
							);
						}
						return;
					}
				},
				{
					signal: this.#signal
				}
			);

			element.addEventListener(
				"contextmenu",
				(event: PointerEvent) => {
					event.preventDefault();
					if (!right) return;

					right(event.clientX / guiScale, event.clientY / guiScale);
				},
				{ signal: this.#signal }
			);
		} else {
			throw new UIError(`onClick called with invalid elemID: ${elemID}`);
		}
	}

	setElementDragResult(
		elementID: number | UiKitElement,
		type: "file",
		path: string
	): void;
	setElementDragResult(
		elementID: number | UiKitElement,
		type: onDragReference["type"],
		data: string
	) {
		const elemID = Number(elementID);
		const step = this.#steps[elemID - 1];

		// insure elemID is valid
		if (elemID > 0 && elemID <= this.#steps.length && step) {
			// Heya! can you finish implementing the drag stuff?

			step.element.addEventListener("dragstart", (event) => {}, {
				signal: this.#signal
			});
			step.element.addEventListener("dragend", (event) => {}, {
				signal: this.#signal
			});
		} else {
			throw new UIError(
				`setElementDragResult called with invalid elemID: ${elemID}`
			);
		}
	}

	onElementDrop(elementID?: number | UiKitElement, callback?: Function) {
		if (callback) isArrow(callback, true);

		const elemID = Number(elementID);
		const step = this.#steps[elemID - 1];

		// insure elemID is valid
		if (elemID > 0 && elemID <= this.#steps.length && step) {
		} else {
			throw new UIError(
				`onElementDrop called with invalid elemID: ${elemID}`
			);
		}
	}

	/**
	 * Makes an element invisible to clicks, allowing elements behind to be clicked.
	 * @param elemID - the ID of the element. this is returned from the creator (eg: `this.renderer.icon()` is a creator.)
	 */
	passthrough(elementID: number | UiKitElement) {
		const elemID = Number(elementID);
		const step = this.#steps[elemID - 1];

		// insure elemID is valid
		if (elemID > 0 && elemID <= this.#steps.length && step) {
			// assign data
			step.element.style.pointerEvents = "none";
		} else {
			throw new UIError(
				`passthrough called with invalid elemID: ${elemID}`
			);
		}
	}

	getCanvasContext(
		elementID: UiKitCanvasElement,
		contextId: string,
		options?: any
	) {
		const elemID = Number(elementID);
		const step = this.#steps[elemID - 1];

		// insure elemID is valid
		if (
			elemID > 0 &&
			elemID <= this.#steps.length &&
			step &&
			step.element instanceof HTMLCanvasElement
		) {
			// assign data
			const canvas = step.element;

			const ctx = canvas.getContext(contextId, options)!;

			const proxied = proxyContext(elementID, ctx);

			return proxied;
		} else {
			throw new UIError(
				`getCanvasContext called with invalid elemID or non-canvas: ${elemID}`
			);
		}
	}

	async awaitClick(callback: () => void | Promise<void>) {
		const init = Date.now();

		if (callback) isArrow(callback, true);

		await new Promise((resolve: Function) => {
			let interval = setInterval(() => {
				if (this.lastClick > init) {
					clearInterval(interval);
					resolve();
					return;
				}
			});
		});

		callback();
	}

	readonly getTextWidth = getTextWidth;
	readonly getTextHeight = getTextHeight;
	readonly insertNewlines = insertNewlines;

	setTextboxContent(id: number | UiKitElement, content: string) {
		const elemID = Number(id);

		// insure there is actually a textbox
		if (this.#creators.textboxElems !== undefined) {
			// set the value
			const elem = this.#creators.textboxElems[elemID];

			if (elem == undefined)
				throw new UIError(`Textbox by ID ${id} doesn't exist.`);

			elem.value = content;
		}
	}

	getTextboxContent(id: number | UiKitElement) {
		const elemID = Number(id);

		return this.#creators.textboxElems[elemID]?.value;
	}

	get darkmode() {
		return (
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		);
	}

	readonly #creators: uiKitCreators;
	readonly #eventCreators: uikitEventCreators;
	readonly #transitioners: uiKitTransitioners;

	/**
	 * Sets the displayed context menu of the window. use .removeContextMenu() to remove it.
	 * @param {number} x - the X position of the context.
	 * @param {number} y - the Y position of the context.
	 * @param {string} header - the header text of the context
	 * @param {Record<string, Function>} buttons - an object of the context's buttons and the function to execute when clicked. Displayed in order that they are assigned. Key names can also use icon-:-text to display an icon with the text, and text after the last semicolon is ignored so that two buttons with the same text can exist.
	 */
	setContextMenu(
		x: number,
		y: number,
		header?: string,
		buttons?: Record<string, Function | undefined>
	) {
		for (const key in buttons) {
			const value = buttons[key];

			if (value == undefined) {
				delete buttons[key];
			}
			if (value) isArrow(value, true);
		}

		// @ts-expect-error
		const noUndefinedButtons: Record<string, Function> = buttons;

		this.removeContextMenu();

		this.#context = new ContextMenu(
			this.#ConstellationKernel,
			x,
			y,
			noUndefinedButtons,
			header
		);
	}
	removeContextMenu() {
		if (this.#context !== undefined) {
			this.#context.remove();
		}

		this.#context = undefined;
	}

	/**
	 * Shows a graphical prompt onscreen
	 * @param title - the main statement
	 * @param subtext - the description of this statement
	 */
	prompt(title: string, subtext = "", icon = this.#window.iconName) {
		const gui = this.#ConstellationKernel.ui;
		if (!(gui.type == "GraphicalInterface"))
			throw new Error(
				"UiKit may not be used in a non-graphical environment"
			);

		gui.windowSystem.showUserPrompt(icon, {
			title,
			subtext,
			primary: "Cancel"
		});
	}

	async showUserPrompt(
		title: string,
		subtext: string,
		primary: string,
		secondary?: string,
		icon: string = this.#window.iconName
	) {
		const gui = this.#ConstellationKernel.ui;
		if (!(gui.type == "GraphicalInterface"))
			throw new Error(
				"UiKit may not be used in a non-graphical environment"
			);

		return await gui.windowSystem.showUserPrompt(icon, {
			title,
			subtext,
			primary,
			secondary
		});
	}

	async askUserQuestion(
		title: string,
		subtext: string,
		icon: string = this.#window.iconName
	) {
		const gui = this.#ConstellationKernel.ui;
		if (!(gui.type == "GraphicalInterface"))
			throw new Error(
				"UiKit may not be used in a non-graphical environment"
			);

		return await gui.windowSystem.askUserQuestion(icon, {
			title,
			subtext
		});
	}

	#deleteElements() {
		// remove all event listeners
		this.#controller.abort();

		// recreate the AbortController so the next set can be bulk removed
		this.#controller = new AbortController();
		this.#signal = this.#controller.signal;
		this.#eventCreators.setSignal(this.#signal);

		// delete all the elements
		for (const i in this.#displayedSteps) {
			const item = this.#displayedSteps[i]?.element;

			// just incase
			if (item == null) {
				if (item !== undefined) {
					this.#removeElement(item);
				}
			}
		}

		// just make sure everything is gone
		this.#window.body.innerHTML = "";
	}

	#removeElement = (element: HTMLElement) => {
		const c = this.#creators;

		if (c.focusedTextbox == element) {
			c.focusedTextbox = undefined;
		}

		if (c.embeddedTui?.container == element) {
			c.embeddedTui.tui.terminate();
			c.embeddedTui = undefined;
		}

		if (
			Object.values(c.textboxElems).includes(element as HTMLInputElement)
		) {
			const entries = Object.entries(c.textboxElems);

			const index = entries
				.map((item) => item[1])
				.indexOf(element as HTMLInputElement);

			const keyname = Number(entries[index][0]);

			c.textboxElems[keyname] = undefined;
		}

		element.remove();
	};

	#nextStep(configStep: ConfigStep, id?: number): number {
		let identifier = id ? id : this.#steps.length + 1;
		this.#index = identifier;

		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return identifier;

		const oldStep = this.#displayedSteps[identifier - 1];
		const oldElement = oldStep?.element;

		// if the element has disappeared, simply remove the old one.
		if (configStep == undefined) {
			if (oldElement) this.#removeElement(oldElement);
			return identifier;
		}

		let newStep: step;

		let stepChanged =
			!oldStep ||
			oldStep.type !== configStep.type ||
			JSON.stringify(oldStep.args) !== JSON.stringify(configStep.args);

		if (stepChanged) {
			const applyCreator = () => {
				if (oldElement) this.#removeElement(oldElement);

				const creator: (
					id: number,
					x: number,
					y: number,
					...args: any[]
				) => HTMLElement = this.#creators[configStep.type].bind(
					this.#creators
				);
				if (!creator) {
					throw new UIError(
						`Creator is not defined for ${configStep.type}`
					);
				}

				// @ts-expect-error // run the creator
				const element = creator(identifier, ...configStep.args);

				return element;
			};

			// use a transitioner to simply modify properties if possible.
			if (oldStep?.type === configStep?.type) {
				// get the transitioner
				const transitioner: (
					element: HTMLElement,
					oldStep: ConfigStep,
					newStep: ConfigStep
				) => boolean =
					// @ts-expect-error
					this.#transitioners[oldStep?.type];

				// prevent trying to apply a transitioner on an element that doesn't exist.
				if (transitioner == undefined || !oldElement) {
					newStep = { ...configStep, element: applyCreator() };
				} else {
					// apply the transitioner
					const result = transitioner(
						oldElement,
						oldStep,
						configStep
					);

					// if it returns false, it can't manage that particular transition.
					if (result == false) {
						newStep = { ...configStep, element: applyCreator() };
					} else {
						stepChanged = false;
						newStep = { ...configStep, element: oldElement };
					}
				}
			} else {
				newStep = { ...configStep, element: applyCreator() };
			}
		} else {
			newStep = { ...configStep, element: oldElement! };
		}

		if (typeof id == "number") {
			this.#steps.splice(id, 1, newStep);
		} else {
			this.#steps.push(newStep);
		}

		// add event listeners to the element
		// the old element had all uiKit event listeners removed by the AbortController

		// event creators manage element-type specific events
		const eventCreator:
			| ((element: HTMLElement, ...args: any) => void)
			// @ts-expect-error
			| undefined = this.#eventCreators[configStep.type];

		if (typeof eventCreator === "function")
			eventCreator.bind(this.#eventCreators)(
				newStep.element,
				...configStep.args
			);

		// prevent layering issues from lower elements being recreated.
		newStep.element.style.zIndex = String(identifier);

		this.#nextDisplayedSteps.push(newStep);

		return identifier;
	}

	/**
	 * Commits all UI elements since the last `renderer.clear()` call.
	 */
	commit = () => {
		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return;

		// focus textbox if relevant
		if (this.#creators.textboxElems !== undefined) {
			if (
				UserInterface.windowSystem.focusedWindow == this.#window.winID
			) {
				const focusedBox = this.#creators.focusedTextbox;

				if (focusedBox) focusedBox.focus();
			}
		}

		// remove extra elements
		for (
			let i = this.#index;
			i < Math.max(this.#steps.length, this.#displayedSteps.length);
			i++
		) {
			const element = this.#displayedSteps[i]?.element;
			if (element) this.#removeElement(element);
		}

		this.#displayedSteps = this.#nextDisplayedSteps;
	};

	terminate() {
		this.#deleteElements();

		this.#window.remove();

		if (this.#context) this.#context.remove();
	}
}

export default class UiKitInstanceCreator {
	#ConstellationKernel: ConstellationKernel;
	style: HTMLStyleElement;
	constructor(
		ConstellationKernel: ConstellationKernel,
		GraphicalInterface: GraphicalInterface
	) {
		this.#ConstellationKernel = ConstellationKernel;

		this.style = document.createElement("style");
		this.style.id = "/src/system/gui/uiKit/styles/styles.css";
		GraphicalInterface.container.appendChild(this.style);
	}

	async init() {
		const styles = await (
			await fetch("/src/system/gui/uiKit/styles/styles.css")
		).text();
		this.style.textContent = styles;
	}
	newRenderer(process?: GuiApplication, window?: GraphicalWindow) {
		return new UiKitRendererClass(
			this.#ConstellationKernel,
			process,
			window
		);
	}

	async terminate() {
		this.style.remove();
	}
}
