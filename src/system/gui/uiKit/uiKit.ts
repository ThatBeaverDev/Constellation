import { GraphicalWindow } from "../display/windowTypes.js";
import {
	getTextHeight,
	getTextWidth,
	insertNewlines
} from "./components/textUtils.js";
import { Application, Process } from "../../runtime/components/executables.js";
import { UIError } from "../../errors.js";
import { ContextMenu } from "./components/contexts.js";
import uiKitCreators from "./components/creators.js";
import {
	onClickOptions,
	step,
	textboxCallbackObject,
	uiKitTimestamp,
	uikitBoxConfig,
	uikitCanvasOptions,
	uikitIconOptions,
	uikitTextareaConfig,
	uikitTextboxConfig
} from "./definitions.js";
import canvasKit from "./components/canvasKit.js";
import uikitEventCreators from "./components/eventCreators.js";
import uiKitTransitioners from "./components/transitioners.js";
import ConstellationKernel from "../../kernel.js";
import { GraphicalInterface } from "../gui.js";

const uiKitStart = performance.now();

// type
export type UiKitRenderer = UiKitRendererClass;

// class
class UiKitRendererClass {
	defaultConfig: {
		uikitTextbox: uikitTextboxConfig;
		uikitTextarea: uikitTextareaConfig;
		uikitBox: uikitBoxConfig;
		uikitCanvasStep: uikitCanvasOptions;
	} = {
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
			isFrosted: false,
			background: "rgb(155, 155, 155)"
		},
		uikitCanvasStep: {
			colour: "rgb(155, 155, 155)"
		}
	};
	#process?: Process;
	#window: GraphicalWindow;
	readonly #steps: step[] = [];
	#displayedSteps: step[] = [];
	elemID: number = 0;
	// add abort controller to remove event listeners
	controller = new AbortController();
	signal: AbortSignal = this.controller.signal;
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
		this.#window.minimise;
	}
	restoreWindow() {
		this.#window.unminimise();
		this.#window.unfullscreen();
	}
	maximiseWindow() {
		this.#window.fullscreen();
	}

	#items: any[] = [];

	#mustRedraw: boolean = false;

	canvas: canvasKit = new canvasKit(this.#steps);
	lastClick: number = 0;

	#ConstellationKernel: ConstellationKernel;

	constructor(
		ConstellationKernel: ConstellationKernel,
		process?: Application,
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

		this.#creators = new uiKitCreators(
			ConstellationKernel,
			this,
			this.#window
		);
		this.#eventCreators = new uikitEventCreators(this);

		this.#transitioners = new uiKitTransitioners();

		document.addEventListener("pointerdown", () => {
			this.lastClick = Date.now();
		});
	}

	clear = () => {
		this.#steps.splice(0, this.#steps.length + 10);

		// window dimensions
		this.windowWidth = this.#window.body.clientWidth;
		this.windowHeight = this.#window.body.clientHeight;

		// window position
		this.windowX = this.#window.position.left;
		this.windowY = this.#window.position.top;

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
		const obj: step = {
			type: "uikitIcon",
			args: [x, y, iconName, iconScale, colour, options]
		};

		return this.#steps.push(obj);
	}

	text(
		x: number,
		y: number,
		string: string,
		fontSize: number = 15,
		colour: string = ""
	) {
		const obj: step = {
			type: "uikitText",
			args: [x, y, string, fontSize, colour]
		};
		return this.#steps.push(obj);
	}
	button(
		x: number,
		y: number,
		string: string,
		leftClickCallback: Function = () => {},
		rightClickCallback: Function = () => {},
		size: number = 15
	) {
		const obj: step = {
			type: "uikitButton",
			args: [x, y, string, leftClickCallback, rightClickCallback, size]
		};
		return this.#steps.push(obj);
	}
	textbox(
		x: number,
		y: number,
		width: number = 200,
		height: number = 20,
		backtext: string,
		callbacks: textboxCallbackObject,
		options: uikitTextboxConfig = this.defaultConfig.uikitTextbox
	) {
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
		return this.#steps.push(obj);
	}

	verticalLine(x: number, y: number, height: number) {
		const obj: step = {
			type: "uikitVerticalLine",
			args: [x, y, height]
		};
		return this.#steps.push(obj);
	}

	horizontalLine(x: number, y: number, width: number) {
		const obj: step = {
			type: "uikitHorizontalLine",
			args: [x, y, width]
		};
		return this.#steps.push(obj);
	}

	progressBar(
		x: number,
		y: number,
		width: number,
		height: number,
		progress: number | "throb"
	) {
		const obj: step = {
			type: "uikitProgressBar",
			args: [x, y, width, height, progress]
		};
		return this.#steps.push(obj);
	}

	textarea(
		x: number,
		y: number,
		width: number,
		height: number,
		callbacks: textboxCallbackObject,
		options: uikitTextareaConfig = this.defaultConfig.uikitTextarea
	) {
		const obj: step = {
			type: "uikitTextarea",
			args: [x, y, width, height, callbacks, options]
		};
		return this.#steps.push(obj);
	}

	box(
		x: number,
		y: number,
		width: number,
		height: number,
		config?: uikitBoxConfig
	) {
		const obj: step = {
			type: "uikitBox",
			args: [x, y, width, height, config]
		};

		return this.#steps.push(obj);
	}

	canvas2D(x: number, y: number, width: number, height: number) {
		const obj: step = {
			type: "uikitCanvas2D",
			args: [x, y, width, height, []] // last arguement (the []) is the list of drawing commands
		};
		return this.#steps.push(obj);
	}

	onClick(
		elemID: number,
		leftClickCallback?: Function,
		rightClickCallback?: Function,
		otherConfig?: onClickOptions
	) {
		const left =
			leftClickCallback == undefined
				? undefined
				: leftClickCallback.bind(this.#process);
		const right =
			rightClickCallback == undefined
				? undefined
				: rightClickCallback.bind(this.#process);

		// insure elemID is valid
		if (elemID > 0 && elemID <= this.#steps.length) {
			// assign data
			this.#steps[elemID - 1].onClick = {
				...(otherConfig || {}),
				left,
				right
			};
		} else {
			throw new UIError(`onClick called with invalid elemID: ${elemID}`);
		}
	}
	/**
	 * Makes an element invisible to clicks, allowing elements behind to be clicked.
	 * @param elemID - the ID of the element. this is returned from the creator (eg: `this.renderer.icon()` is a creator.)
	 */
	passthrough(elemID: number) {
		// insure elemID is valid
		if (elemID > 0 && elemID <= this.#steps.length) {
			// assign data
			this.#steps[elemID - 1].passthrough = true;
		} else {
			throw new UIError(`onClick called with invalid elemID: ${elemID}`);
		}
	}

	async awaitClick(callback: () => void | Promise<void>) {
		const init = Date.now();

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

	setTextboxContent(id: number, content: string) {
		// insure there is actually a textbox
		if (this.#creators.textboxElems !== undefined) {
			// set the value
			const elem = this.#creators.textboxElems[id];

			if (elem == undefined)
				throw new UIError(`Textbox by ID ${id} doesn't exist.`);

			elem.value = content;
		}
	}

	getTextboxContent(id: number) {
		return this.#creators.textboxElems[id]?.value;
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
		header: string,
		buttons: Record<string, Function>
	) {
		this.removeContextMenu();

		this.#context = new ContextMenu(
			this.#ConstellationKernel,
			x,
			y,
			header,
			buttons
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

	redraw = () => {
		this.#mustRedraw = true;
	};

	#deleteElements() {
		// remove all event listeners
		this.controller.abort();

		// recreate the AbortController so the next set can be bulk removed
		this.controller = new AbortController();
		this.signal = this.controller.signal;

		this.#displayedSteps = [];

		// delete all the elements
		for (const i in this.#items) {
			const item = this.#items[i];

			// just incase
			if (item !== null) {
				this.removeElement(item);
			}
			// @ts-ignore
			this.#items.splice(i, 1);
		}

		// just make sure everything is gone
		this.#window.body.innerHTML = "";
	}

	removeElement = (element: HTMLElement) => {
		const c = this.#creators;

		if (c.focusedTextbox == element) {
			c.focusedTextbox = undefined;
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

	/**
	 * Commits all UI elements since the last `renderer.clear()` call.
	 */
	commit() {
		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return;

		const start = performance.now();

		this.windowWidth = this.#window.body.clientWidth;
		this.windowHeight = this.#window.body.clientHeight;

		if (this.#creators.textboxElems !== undefined) {
			if (
				UserInterface.windowSystem.focusedWindow == this.#window.winID
			) {
				const focusedBox = this.#creators.focusedTextbox;

				if (focusedBox) focusedBox.focus();
			}
		}

		function objectEquality(
			object1: Record<string, any>,
			object2: Record<string, any>
		) {
			const keys1 = Object.keys(object1);
			const keys2 = Object.keys(object2);

			if (keys1 !== keys2) return false;

			for (const key in object1) {
				const val1 = object1[key];
				const val2 = object2[key];

				if (typeof val1 !== typeof val2) return false;

				switch (typeof val1) {
					case "object": {
						const same = objectEquality(val1, val2);
						if (!same) return false;
						break;
					}
					case "function": {
						const fn1 = val1.toString();
						const fn2 = val2.toString();

						if (fn1 !== fn2) return false;
						break;
					}
					default: {
						const same = val1 == val2;
						if (!same) return false;
					}
				}
			}
		}

		if (!this.#mustRedraw) {
			if (this.#steps.length === this.#displayedSteps.length) {
				let same = true;

				for (let i = 0; i < this.#steps.length; i++) {
					const st = this.#steps[i];
					const ds = this.#displayedSteps[i];

					if (st.type !== ds.type) {
						same = false;
						break;
					}

					const argsSame = objectEquality(st.args, ds.args);
					if (!argsSame) {
						same = false;
						break;
					}
				}

				if (same) return;
			}
		}

		// prevent infinite redraws
		this.#mustRedraw = false;

		// Abort all listeners, but keep the elements unless they are removed
		this.controller.abort();
		this.controller = new AbortController();
		this.signal = this.controller.signal;

		const newItems: HTMLElement[] = [];
		const newDisplayedSteps: step[] = [];

		for (
			let i = 0;
			i < Math.max(this.#steps.length, this.#displayedSteps.length);
			i++
		) {
			const start = performance.now();

			const newStep = this.#steps[i];
			const oldStep = this.#displayedSteps[i];
			const oldElement = this.#items[i];

			// if the element has disappeared, simply remove the old one.
			if (newStep == undefined) {
				this.removeElement(oldElement);
				continue;
			}

			let element: HTMLElement;

			let stepChanged =
				!oldStep ||
				oldStep.type !== newStep.type ||
				JSON.stringify(oldStep.args) !== JSON.stringify(newStep.args);

			if (stepChanged) {
				const applyCreator = () => {
					if (oldElement) this.removeElement(oldElement);

					const creator: (
						id: number,
						x: number,
						y: number,
						...args: any[]
					) => HTMLElement = this.#creators[newStep.type].bind(
						this.#creators
					);
					if (!creator) {
						throw new UIError(
							`Creator is not defined for ${newStep.type}`
						);
					}

					// @ts-expect-error // run the creator
					const element = creator(i + 1, ...newStep.args);

					if (newStep.passthrough == true) {
						element.style.pointerEvents = "none";
					}

					return element;
				};

				// use a transitioner to simply modify properties if possible.
				if (oldStep?.type === newStep?.type) {
					// get the transitioner
					const transitioner: (
						element: HTMLElement,
						oldStep: step,
						newStep: step
					) => boolean =
						// @ts-expect-error
						this.#transitioners[oldStep?.type];

					// prevent trying to apply a transitioner on an element that doesn't exist.
					if (transitioner == undefined) {
						element = applyCreator();
					} else {
						// apply the transitioner
						const result = transitioner(
							oldElement,
							oldStep,
							newStep
						);

						// if it returns false, it can't manage that particular transition.
						if (result == false) {
							element = applyCreator();
						} else {
							stepChanged = false;
							element = oldElement;
						}
					}
				} else {
					element = applyCreator();
				}
			} else {
				element = oldElement!;
			}

			// add event listeners to the element
			// the old element had all uiKit event listeners removed by the AbortController

			// event creators manage element-type specific events
			const eventCreator:
				| ((element: HTMLElement, ...args: any) => void)
				// @ts-expect-error
				| undefined = this.#eventCreators[newStep.type];

			if (typeof eventCreator === "function")
				eventCreator.bind(this.#eventCreators)(
					element,
					...newStep.args
				);

			if (newStep.onClick !== undefined) {
				const gui = this.#ConstellationKernel.ui;
				if (!(gui.type == "GraphicalInterface")) return;

				const scale = gui.displayScaling || 0;

				element.classList.add("clickable");
				element.style.setProperty(
					"--scale",
					String(newStep.onClick.scale || 1.3)
				);
				element.style.setProperty(
					"--click-scale",
					String(newStep.onClick.clickScale || 1.5)
				);
				element.style.setProperty(
					"--origin",
					newStep.onClick.origin || "center"
				);

				let pressTimer: ReturnType<typeof setTimeout> | null = null;
				let longPressTriggered = false;

				element.addEventListener(
					"pointerdown",
					(event: PointerEvent) => {
						if (!newStep.onClick) return;
						longPressTriggered = false;

						if (
							event.pointerType === "touch" ||
							event.pointerType === "pen"
						) {
							pressTimer = setTimeout(() => {
								longPressTriggered = true;
								if (
									typeof newStep.onClick?.right === "function"
								) {
									event.preventDefault();
									newStep.onClick.right(
										event.clientX / scale,
										event.clientY / scale
									);
								}
							}, 500);
							return; // Skip mouse clicks on touch/pen
						}
					},
					{ signal: this.signal }
				);

				element.addEventListener(
					"pointerup",
					(event: PointerEvent) => {
						if (!newStep.onClick) return;

						if (
							event.pointerType === "touch" ||
							event.pointerType === "pen"
						) {
							if (longPressTriggered) {
								event.preventDefault();
								return; // skip click after long press
							}
						}

						switch (event.button) {
							case 0:
								if (
									typeof newStep.onClick.left === "function"
								) {
									event.preventDefault();
									newStep.onClick.left(
										event.clientX / scale,
										event.clientY / scale
									);
								}
								break;
						}
					},
					{ signal: this.signal }
				);

				// Clear timer on end/cancel/leave
				const clearLongPress = () => {
					if (pressTimer) clearTimeout(pressTimer);
					pressTimer = null;
				};

				["pointerup", "pointercancel", "pointerleave"].forEach(
					(eventName) => {
						element.addEventListener(eventName, clearLongPress, {
							signal: this.signal
						});
					}
				);

				// Always prevent contextmenu for touch/pen
				element.addEventListener(
					"contextmenu",
					(event: MouseEvent | PointerEvent) => {
						if (!newStep.onClick) return;

						// prevent contextmenu after long press or on touch entirely
						if (
							(event as PointerEvent).pointerType === "touch" ||
							(event as PointerEvent).pointerType === "pen" ||
							longPressTriggered
						) {
							event.preventDefault();
							return;
						}

						if (typeof newStep.onClick.right === "function") {
							event.preventDefault();
							newStep.onClick.right(
								event.clientX / scale,
								event.clientY / scale
							);
						}
					},
					{ signal: this.signal }
				);
			}

			// prevent layering issues from lower elements being recreated.
			element.style.zIndex = String(i);

			newItems.push(element);
			newDisplayedSteps.push(newStep);

			uiKitTimestamp(`Commit Step ${newStep.type}`, start);
		}

		//// remove missed old elements
		//for (let i = this.steps.length; i < this.items.length; i++) {
		//	const item = this.items[i];
		//	if (item) item.remove();
		//}

		this.#items = newItems;
		this.#displayedSteps = newDisplayedSteps;

		uiKitTimestamp("Commit to Window", start);
	}

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
	newRenderer(process?: Application, window?: GraphicalWindow) {
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

uiKitTimestamp("Startup of src/gui/uiKit/uiKit.ts", uiKitStart, "primary");
