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
	ConfigStep,
	Colour
} from "./definitions.js";
import uikitEventCreators from "./components/eventCreators.js";
import UiKitTransitioners from "./components/transitioners.js";
import ConstellationKernel from "../../kernel.js";
import { GraphicalInterface } from "../gui.js";
import {
	UiKitElement,
	uikitProgressBarElement,
	UiKitTextareaElement,
	UiKitTextboxElement
} from "./components/elementReference.js";
import { UiKitCanvasElement } from "./components/canvas/canvas.js";
import { isArrow } from "../../security/components/testers/isArrow.js";
import { defaultConfig } from "./components/defaultConfig.js";
import { proxyContext } from "./components/canvas/ctx.js";
import UiKitAudioSystem from "./components/audio.js";
import { setElementProperty, setElementStyle } from "../html.js";
import { StepStorage } from "./components/stepStorage.js";

// type
export type UiKitRenderer = UiKitRendererClass;

// class
export class UiKitRendererClass {
	#process?: Process;
	#window: GraphicalWindow;

	#nextID: number = 0;
	#index: number = 0;
	readonly #steps = new StepStorage<step | ConfigStep>();

	// add abort controller to remove event listeners
	#controller = new AbortController();
	#signal: AbortSignal = this.#controller.signal;
	#context?: ContextMenu;

	readonly #creators: uiKitCreators;
	readonly #eventCreators: uikitEventCreators;
	readonly #transitioners: UiKitTransitioners;
	readonly audio: UiKitAudioSystem;

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

	set windowBackgroundStyles(background: "glow" | string) {
		if (background == "glow") {
			setElementStyle(
				this.#window.container,
				"background",
				"rgba(5, 5, 5, 75%)"
			);
			setElementStyle(
				this.#window.container,
				"backdropFilter",
				"blur(25px)"
			);
		} else {
			setElementStyle(this.#window.container, "background", background);
			setElementStyle(this.#window.container, "backdropFilter", "");
		}
	}
	get windowBackgroundStyles() {
		return this.#window.container.style.background;
	}

	setIcon(name: string) {
		this.#window.setIcon(name);
	}
	getIcon() {
		return this.#window.iconName;
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
		this.#eventCreators = new uikitEventCreators(
			UserInterface,
			this.#signal,
			this.#window
		);
		this.audio = new UiKitAudioSystem(this, this.#ConstellationKernel);
		this.#transitioners = new UiKitTransitioners(window);

		document.addEventListener("pointerdown", () => {
			this.lastClick = Date.now();
		});

		this.windowBackgroundStyles = "glow";

		if (process) this.#loadIcon(process);
	}

	async #loadIcon(process: GuiApplication) {
		const processPath = process.env.fs.resolve("./config.js");
		const conf: ApplicationManifest = (
			await process.env.fs.include(processPath)
		).default;

		if (conf.icon && this.getIcon() == "app-window-mac")
			this.setIcon(conf.icon);
	}

	clear = () => {
		// reset scroll
		setElementProperty(this.#window.body, "scrollLeft", 0);
		setElementProperty(this.#window.body, "scrollTop", 0);

		this.#steps.clear();

		// window dimensions
		this.windowWidth = this.#window.body.clientWidth;
		this.windowHeight = this.#window.body.clientHeight;

		// window position
		this.windowX = this.#window.position.left;
		this.windowY = this.#window.position.top;

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

		this.#nextID = 0;
		this.#index = 0;
	};

	icon(
		x: number,
		y: number,
		iconName: string,
		iconScale: number = 1,
		colour: string = "",
		options: uikitIconOptions = {}
	) {
		const obj: ConfigStep = {
			type: "uikitIcon",
			args: [x, y, iconName, iconScale, colour, options]
		};

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	image(
		x: number,
		y: number,
		location: string,
		width: number,
		height: number,
		options: uikitIconOptions = {}
	) {
		const obj: ConfigStep = {
			type: "uikitImage",
			args: [x, y, location, width, height, options]
		};

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	text(
		x: number,
		y: number,
		string: string,
		fontSize: number = 15,
		colour?: Colour,
		font?: string
	) {
		const obj: ConfigStep = {
			type: "uikitText",
			args: [x, y, string, fontSize, colour, font]
		};

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
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

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}
	textbox(
		x: number,
		y: number,
		width: number = 200,
		height: number = 20,
		backtext: string,
		callbacks: textboxCallbackObject,
		options: uikitTextboxConfig = defaultConfig.uikitTextbox,
		id?: string
	) {
		if (callbacks.enter) isArrow(callbacks.enter, true);
		if (callbacks.beforeUpdate) isArrow(callbacks.beforeUpdate, true);
		if (callbacks.afterUpdate) isArrow(callbacks.afterUpdate, true);

		const obj: ConfigStep = {
			type: "uikitTextbox",
			args: [x, y, width, height, backtext, callbacks, options]
		};

		const identifier = id ?? this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitTextboxElement(this, identifier);
	}

	verticalLine(x: number, y: number, height: number) {
		const obj: ConfigStep = {
			type: "uikitVerticalLine",
			args: [x, y, height]
		};

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	horizontalLine(x: number, y: number, width: number, colour: string) {
		const obj: ConfigStep = {
			type: "uikitHorizontalLine",
			args: [x, y, width, colour]
		};

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	progressBar(
		x: number,
		y: number,
		width: number,
		height: number,
		progress: number | "throb",
		onDrag: (progress: number) => Promise<void> | void,
		colour: string = "panel"
	) {
		const obj: ConfigStep = {
			type: "uikitProgressBar",
			args: [x, y, width, height, progress, onDrag, colour]
		};

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new uikitProgressBarElement(this, identifier);
	}

	textarea(
		x: number,
		y: number,
		width: number,
		height: number,
		callbacks: textboxCallbackObject,
		options: uikitTextareaConfig = defaultConfig.uikitTextarea,
		id?: string
	) {
		if (callbacks.enter) isArrow(callbacks.enter, true);
		if (callbacks.beforeUpdate) isArrow(callbacks.beforeUpdate, true);
		if (callbacks.afterUpdate) isArrow(callbacks.afterUpdate, true);

		const obj: ConfigStep = {
			type: "uikitTextarea",
			args: [x, y, width, height, callbacks, options]
		};

		const identifier = id ?? this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitTextareaElement(this, identifier);
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

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	canvas2D(x: number, y: number, width: number, height: number) {
		const obj: ConfigStep = {
			type: "uikitCanvas2D",
			args: [x, y, width, height]
		};

		const identifier = this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	embeddedTui(
		x: number,
		y: number,
		width: number,
		height: number,
		id: string
	) {
		const obj: ConfigStep = {
			type: "uikitEmbeddedTui",
			args: [x, y, width, height]
		};

		const identifier = id ?? this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	iframe(
		x: number,
		y: number,
		width: number,
		height: number,
		URL: string,
		onMessage: (data: any) => Promise<void> | void,
		isTransparent: boolean = false,
		id: string
	) {
		const obj: ConfigStep = {
			type: "uikitIframe",
			args: [x, y, width, height, URL, onMessage, isTransparent]
		};

		const identifier = id ?? this.#nextID++;

		this.#nextStep(identifier, obj);
		return new UiKitElement(this, identifier);
	}

	onClick(
		elementID: UiKitElement,
		leftClickCallback?: clickReference["left"],
		rightClickCallback?: clickReference["right"],
		otherConfig?: onClickOptions
	) {
		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return;
		const guiScale = UserInterface.displayScaling;

		if (leftClickCallback) isArrow(leftClickCallback, true);
		if (rightClickCallback) isArrow(rightClickCallback, true);

		const elemID = elementID.id;

		const left =
			leftClickCallback == undefined
				? undefined
				: leftClickCallback.bind(this.#process);
		const right =
			rightClickCallback == undefined
				? undefined
				: rightClickCallback.bind(this.#process);

		const step = this.#steps.get(elemID);

		// insure elemID is valid
		if (step && "element" in step) {
			// assign data
			const element = step.element;

			if (otherConfig?.hoverEffect !== false)
				element.classList.add("clickable");

			const longPressHoldDuration = 500;

			element.addEventListener(
				"pointerdown",
				(event: PointerEvent) => {
					const start = Date.now();

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

	setProgressbarDrag(elementID: uikitProgressBarElement, progress: number) {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure there is actually a progress bar
		if (step?.type == "uikitProgressBar") {
			step.args[5](progress);
		}
	}

	setElementDragResult(
		elementID: UiKitElement,
		type: "file",
		path: string
	): void;
	setElementDragResult(
		elementID: UiKitElement,
		type: onDragReference["type"],
		data: string
	) {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure elemID is valid
		if (step && "element" in step) {
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

	onElementDrop(elementID: UiKitElement, callback: Function) {
		if (callback) isArrow(callback, true);

		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure elemID is valid
		if (step && "element" in step) {
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
	passthrough(elementID: UiKitElement) {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure elemID is valid
		if (step && "element" in step) {
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
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure elemID is valid
		if (
			step &&
			"element" in step &&
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

	setTextboxContent(elementID: UiKitTextboxElement, content: string) {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure there is actually a textbox
		if (
			step &&
			"element" in step &&
			(step.element instanceof HTMLInputElement ||
				step.element instanceof HTMLTextAreaElement)
		) {
			// set the value
			const elem = step.element;

			if (elem == undefined)
				throw new UIError(`Textbox by ID ${elementID} doesn't exist.`);

			elem.value = content;
		}
	}

	getTextboxContent(elementID: UiKitTextboxElement) {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure there is actually a textbox
		if (
			step &&
			"element" in step &&
			(step.element instanceof HTMLInputElement ||
				step.element instanceof HTMLTextAreaElement)
		) {
			// get the value
			const elem = step.element;

			if (elem == undefined)
				throw new UIError(`Textbox by ID ${elementID} doesn't exist.`);

			return elem.value;
		}
	}

	getTextareaScroll(elementID: UiKitTextareaElement) {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure there is actually a textbox
		if (
			step &&
			"element" in step &&
			step.element instanceof HTMLTextAreaElement
		) {
			// get the value
			const elem = step.element;

			if (elem == undefined)
				throw new UIError(`Textarea by ID ${elementID} doesn't exist.`);

			return 0 - elem.scrollTop;
		}
	}

	getTextboxSelection(
		elementID: UiKitTextboxElement | UiKitTextareaElement
	): [number, number] | undefined {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure there is actually a textbox
		if (
			step &&
			"element" in step &&
			(step.element instanceof HTMLInputElement ||
				step.element instanceof HTMLTextAreaElement)
		) {
			// get the value
			const elem = step.element;

			if (elem == undefined)
				throw new UIError(`Textbox by ID ${elementID} doesn't exist.`);

			return [elem.selectionStart ?? 0, elem.selectionEnd ?? 0];
		}
	}

	focusTextbox(elementID: UiKitTextboxElement) {
		const elemID = elementID.id;
		const step = this.#steps.get(elemID);

		// insure there is actually a textbox
		if (
			step &&
			"element" in step &&
			(step.element instanceof HTMLInputElement ||
				step.element instanceof HTMLTextAreaElement)
		) {
			// set the value
			const elem = step.element;

			if (elem == undefined)
				throw new UIError(`Textbox by ID ${elementID} doesn't exist.`);

			elem.focus();
		}
	}

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
		for (const i in this.#steps) {
			const step = this.#steps.get(i);

			if (!step || !("element" in step)) continue;

			const item = step.element;

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

	#nextStep(id: string | number, configStep: ConfigStep) {
		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return;

		this.#index++;

		const oldStep = this.#steps.get(id);
		const oldElement = oldStep
			? "element" in oldStep
				? oldStep.element
				: undefined
			: undefined;

		// if the element has disappeared, simply remove the old one.
		if (configStep == undefined) {
			if (oldElement) this.#removeElement(oldElement);
			return id;
		}

		let newStep: step;

		let stepChanged =
			!oldStep ||
			oldStep.type !== configStep.type ||
			oldStep.args.length !== configStep.args.length ||
			JSON.stringify(oldStep.args) !== JSON.stringify(configStep.args);

		if (stepChanged) {
			const applyCreator = () => {
				oldElement;
				if (oldElement) {
					this.#removeElement(oldElement);
				}

				const creator: (id: number, ...args: any[]) => HTMLElement =
					this.#creators[configStep.type].bind(this.#creators);
				if (!creator) {
					throw new UIError(
						`Creator is not defined for ${configStep.type}`
					);
				}

				// run the creator
				const element = creator(this.#index, ...configStep.args);

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
		setElementStyle(newStep.element, "zIndex", String(this.#index));

		this.#steps.set(id, newStep);

		return id;
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
		const unchanged = this.#steps.getUnchanged();

		for (const [id, step] of unchanged) {
			this.#steps.delete(id);

			if (!step || !("element" in step)) continue;

			step.element.remove();
		}

		/* ---------- Make sure no 'rogue' elements are present that shouldn't be ---------- */

		const windowBodyElements = Array.from(this.#window.body.children);
		const allowedElements: Element[] = this.#steps
			.toArray()
			.map((item) => ("element" in item ? item.element : undefined))
			.filter((item) => item !== undefined);

		for (const el of windowBodyElements) {
			if (!allowedElements.includes(el)) {
				el.remove();
			}
		}
	};

	terminate() {
		this.#deleteElements();
		this.audio.terminate();

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
