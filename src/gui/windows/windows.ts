import { Application } from "../../runtime/executables.js";
import { terminate } from "../../runtime/runtime.js";
import { DevToolsColor, performanceLog } from "../../lib/debug.js";
import ConstellationKernel from "../../kernel.js";
import cssVariables, { applyWindowsCSS } from "./css.js";
import { showUserPrompt } from "../prompt.js";

const start = performance.now();
const name = "/System/windows.js";

export function windowsTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "WindowSystem", colour);
}

function clamp(n: number | undefined, min: number, max: number) {
	if (n == undefined) {
		return 0;
	}

	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}
	return n;
}

applyWindowsCSS();

interface snappingWindowInfo {
	window: GraphicalWindowClass;
	side: "left" | "right" | "fullscreen";
}

export default class WindowSystem {
	// constants
	readonly EDGE_THRESHOLD = 8;
	readonly minHeight = 25;
	readonly minWidth = 100;
	readonly windowHeaderHeight = 25;

	windows: GraphicalWindowClass[] = [];
	allWindows() {
		return this.windows;
	}

	// variables
	minimiseAnimation = "flick";
	/**
	 * ID of the currently focused window
	 */
	focusedWindow: number | undefined;
	target:
		| {
				window: GraphicalWindowClass;

				originX: number;
				originY: number;

				windowX: number;
				windowY: number;

				hasMoved: boolean;
		  }
		| undefined = undefined;
	startMouseX = 0;
	startMouseY = 0;
	offsetX = 0;
	offsetY = 0;

	winID = 0;
	windowTilingNumber = 0;
	#ConstellationKernel: ConstellationKernel;
	cssVariables: cssVariables;

	_snappingWindow: snappingWindowInfo | undefined;
	_snappingWindowDisplay: HTMLDivElement = (() => {
		const elem = document.createElement("div");
		elem.id = String(window.renderID++);
		elem.className = "windowSnappingIndicator";

		document.body.appendChild(elem);

		return elem;
	})();
	set snappingWindow(info: snappingWindowInfo | undefined) {
		// make it snap

		if (info == undefined) {
			// no more snapping

			this._snappingWindowDisplay.classList.remove("snapRight");
			this._snappingWindowDisplay.classList.remove("snapLeft");
			this._snappingWindowDisplay.classList.remove("snapFullscreen");

			this._snappingWindow = undefined;

			return;
		}

		if (
			this._snappingWindow?.window === info.window &&
			this._snappingWindow.side == info.side
		) {
			return;
		}

		switch (info.side) {
			case "left":
				this._snappingWindowDisplay.classList.remove("snapRight");
				this._snappingWindowDisplay.classList.remove("snapFullscreen");
				this._snappingWindowDisplay.classList.add("snapLeft");

				break;
			case "right":
				this._snappingWindowDisplay.classList.remove("snapLeft");
				this._snappingWindowDisplay.classList.remove("snapFullscreen");
				this._snappingWindowDisplay.classList.add("snapRight");

				break;
			case "fullscreen":
				this._snappingWindowDisplay.classList.remove("snapLeft");
				this._snappingWindowDisplay.classList.remove("snapRight");
				this._snappingWindowDisplay.classList.add("snapFullscreen");
				break;
		}

		this._snappingWindow = info;
	}

	get snappingWindow(): snappingWindowInfo | undefined {
		return this._snappingWindow;
	}

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;

		// init css styles
		this.cssVariables = new cssVariables(ConstellationKernel);
		this.setCSSVariable = this.cssVariables.setCSSVariable.bind(
			this.cssVariables
		);

		// event listeners

		const windowPointerDown = (e: PointerEvent) => {
			// clear target if clicking outside windows
			// target is assigned within the window's constructor.

			if (!this.target) return;
			e.preventDefault();
		};
		window.addEventListener("pointerdown", windowPointerDown);

		const windowPointerMove = (e: PointerEvent) => {
			if (!this.target) return;

			const x = e.clientX - this.offsetX;
			const y = e.clientY - this.offsetY;

			this.target.windowX = x;
			this.target.windowY = y;

			const win = this.target.window;

			if (this.target.hasMoved) {
				//setTimeout(() => {
				const snappingInfo = win.move(x, y);
				win.unfullscreen();

				let side: "left" | "right" | "fullscreen" | undefined =
					undefined;

				if (snappingInfo.snapLeft) {
					side = "left";
				} else if (snappingInfo.snapRight) {
					side = "right";
				} else if (snappingInfo.snapFullscreen) {
					side = "fullscreen";
				}

				// no snapping needed
				if (side == undefined) {
					if (this.snappingWindow?.window == win) {
						this.snappingWindow = undefined;
					}
					return;
				}

				this.snappingWindow = {
					window: win,
					side
				};
				//}, 10);
			} else {
				const distanceX = Math.abs(
					this.target.windowX - this.target.originX
				);
				const distanceY = Math.abs(
					this.target.windowY - this.target.originY
				);
				const distancePythagoras = Math.sqrt(
					distanceX ** 2 + distanceY ** 2
				);

				if (distancePythagoras > 10) {
					this.target.hasMoved = true;
				}
			}
		};
		window.addEventListener("pointermove", windowPointerMove);

		// stop the dragging
		const windowPointerUp = (e: PointerEvent) => {
			if (this.snappingWindow !== undefined) {
				// we need to actually snap the window

				const win = this.snappingWindow.window;
				switch (this.snappingWindow.side) {
					case "left":
						win.move(0, 0);
						win.resize(
							window.innerWidth / 2,
							window.innerHeight,
							true
						);
						break;
					case "right":
						win.move(window.innerWidth / 2, 0);
						win.resize(
							window.innerWidth / 2,
							window.innerHeight,
							true
						);
						break;
					case "fullscreen":
						win.move(0, 0);
						win.resize(window.innerWidth, window.innerHeight, true);
				}

				this.snappingWindow = undefined;
			}

			this.target = undefined;
		};
		window.addEventListener("pointerup", windowPointerUp);

		window.addEventListener("resize", () => {
			this.updateWindows();
		});

		document.addEventListener(
			"touchmove",
			function preventBehavior(e: TouchEvent) {
				e.preventDefault();
			},
			{ passive: false }
		);

		this.styleElem = document.createElement("style");
		this.styleElem.id = String(window.renderID++);
		this.styleElem.className = "windowsAnimationStyles";

		document.body.appendChild(this.styleElem);

		setInterval(() => {
			if (this.minimiseAnimation !== this.oldMinimiseAnimation) {
				this.oldMinimiseAnimation = String(this.minimiseAnimation);
				this.updateLiveStyling();
			}
		});
	}

	setCSSVariable: typeof this.cssVariables.setCSSVariable;

	maxWinID = 0;

	/**
	 * Returns the window of the given ID, **or the focused window if unspecified.**
	 * @param id - the ID to search for
	 * @returns Window by the requested ID if found, else undefined.
	 */
	getWindowOfId(id: number | undefined = this.focusedWindow) {
		for (const window of this.windows) {
			if (window.winID == id) {
				return window;
			}
		}
	}

	focusWindow(id: number) {
		const start = performance.now();
		const target = this.getWindowOfId(id);

		if (target == undefined) {
			// that window doesn't exist!
			return undefined;
		}

		const supposedlyFocusedWindows = document.querySelectorAll(".focused");

		// remove focus from all windows
		for (const elem of supposedlyFocusedWindows) {
			elem.classList.remove("focused");
		}

		// focus our window
		this.focusedWindow = id;
		target.container.classList.add("focused");
		target.move(
			target.position.left,
			target.position.top,
			this.windowTilingNumber++,
			false
		);

		windowsTimestamp(`Focus window ${id}`, start);
	}

	setMinimiseEffect(effect: string) {
		this.minimiseAnimation = String(effect);
	}

	updateWindows() {
		const start = performance.now();

		// get amount of windows which are visible.
		let totalWindows = 0;
		for (const win of this.windows) {
			if (win.visible) {
				totalWindows++;
			}
		}

		this.windows.forEach((win, index) => {
			win.container.style.resize = "both";

			win.reposition();
		});

		windowsTimestamp("Update Windows", start);
	}

	newWindow(title: string, ApplicationObject?: Application) {
		const start = performance.now();

		const win = new GraphicalWindowClass(
			this.#ConstellationKernel,
			title,
			ApplicationObject
		);

		this.focusWindow(win.winID);

		this.updateWindows();

		windowsTimestamp("Create new Window", start);

		return {
			id: win.winID,
			data: win
		};
	}

	oldMinimiseAnimation: string | undefined = undefined; // undefined so that we definitely initialise the mode we are in.

	reapplyStyles() {
		this.oldMinimiseAnimation = undefined;
	}

	styleElem: HTMLStyleElement;

	async updateLiveStyling() {
		const start = performance.now();

		this.#ConstellationKernel.lib.logging.debug(
			name,
			"Loading windowing CSS for minimise animation: " +
				this.minimiseAnimation
		);

		const css = await this.#ConstellationKernel.fs.readFile(
			"/System/windows/" + this.minimiseAnimation + ".css"
		);

		if (css == undefined) {
			return;
		}

		this.#ConstellationKernel.lib.logging.debug(
			name,
			"CSS retrieved successfully for minimise animation: " +
				this.minimiseAnimation
		);

		this.styleElem.textContent = css;

		windowsTimestamp("Update CSS Styling", start);
	}

	/**
	 * Displays a prompt to the user, providing a title, description and two options for buttons.
	 * @param icon - Icon to display at the top of the popup
	 * @param config - Configuration object to define properties of the popup
	 * @returns "primary" or "secondary", depending on whether the first or second button is pressed.
	 */
	async showUserPrompt(
		icon: string,
		config: {
			title: string;
			subtext: string;
			primary: string;
			secondary?: string;
		}
	): Promise<"primary" | "secondary" | never> {
		return await showUserPrompt(
			this.#ConstellationKernel,
			icon,
			"statement",
			config
		);
	}

	async askUserQuestion(
		icon: string,
		config: { title: string; subtext: string; defaultAnswer?: string }
	) {
		return await showUserPrompt(
			this.#ConstellationKernel,
			icon,
			"question",
			config
		);
	}
}
windowsTimestamp("Startup of src/windows/windows.ts", start, "primary");

export type GraphicalWindow = GraphicalWindowClass;

class GraphicalWindowClass {
	#WindowSystem: WindowSystem;
	#ConstellationKernel: ConstellationKernel;

	constructor(
		ConstellationKernel: ConstellationKernel,
		name: string,
		Application?: Application
	) {
		this.#ConstellationKernel = ConstellationKernel;
		if (ConstellationKernel.GraphicalInterface == undefined)
			throw new Error("Windows cannot exist on a non-graphical system.");

		const WindowSystem = ConstellationKernel.GraphicalInterface.windows;
		this.#WindowSystem = WindowSystem;
		this.name = name;
		this.winID = WindowSystem.winID++;
		this.Application = Application;

		this.winID = WindowSystem.maxWinID++;
		WindowSystem.windows.push(this);

		// position windows where requested or at the default location
		const width: number = 500;
		const height: number = 300;

		const left = (window.innerWidth - width) / 2;
		const top = (window.innerHeight - height) / 2;

		this.title = document.createElement("p");
		const t = this.title;
		t.className = "windowTitle";
		t.id = String(window.renderID++);
		t.innerText = name;

		// window icon
		this.iconDiv = document.createElement("div");
		this.iconDiv.id = String(window.renderID++);
		this.iconDiv.style.position = "static";
		this.iconDiv.style.width = "20px";
		this.iconDiv.style.height = "20px";
		this.iconDiv.style.top = "3px";

		let right = 3;
		const windowButton = (iconpath: string) => {
			const button = document.createElement("div");
			button.id = String(window.renderID++);
			button.classList.add("windowButton");

			button.style.background = "#CCCCCC";
			button.style.borderRadius = "7px";

			button.style.position = "absolute";
			button.style.top = "3px";
			button.style.right = `${right}px`;

			button.style.width = "20px";
			button.style.height = "20px";

			const kernel = this.#ConstellationKernel;
			let icon: HTMLImageElement;
			if (kernel.GraphicalInterface) {
				icon = kernel.GraphicalInterface.getIcon(iconpath);
			} else {
				// just so typescript doesn't freak out. this will never happen.
				icon = document.createElement("img");
			}
			icon.style.width = "16px";
			icon.style.height = "16px";
			icon.style.filter =
				"drop-shadow(0px, 4px, 4px, rgba(0, 0, 0, 0.25))";
			icon.classList.add("windowButtonIcon");

			icon.style.left = "2px";
			icon.style.top = "2px";
			button.appendChild(icon);

			right += 23;

			return button;
		};

		this.closeButton = windowButton(
			"/System/CoreAssets/Vectors/windows/close.svg"
		);
		this.minimiseButton = windowButton(
			"/System/CoreAssets/Vectors/windows/minimise.svg"
		);
		this.maximiseButton = windowButton(
			"/System/CoreAssets/Vectors/windows/fullscreen.svg"
		);

		this.header = document.createElement("div");
		const h = this.header;
		h.className = "windowHeader";
		h.id = String(window.renderID++);
		h.innerHTML =
			this.iconDiv.outerHTML +
			this.title.outerHTML +
			this.maximiseButton.outerHTML +
			this.minimiseButton.outerHTML +
			this.closeButton.outerHTML;

		this.body = document.createElement("div");
		const b = this.body;
		b.className = "windowBody";
		b.id = String(window.renderID++);

		// container
		this.container = document.createElement("div");
		const c = this.container;
		c.className = "windowContainer";
		c.id = String(window.renderID++);
		c.dataset.width = String(width);
		c.dataset.height = String(height);
		c.dataset.left = String(left);
		c.dataset.top = String(top);
		this.container.innerHTML = this.header.outerHTML + this.body.outerHTML;

		this.move(left, top);
		this.resize(width, height);

		document.body.appendChild(this.container);

		this.container = document.getElementById(this.container.id)!;
		this.body = document.getElementById(this.body.id)!;
		this.header = document.getElementById(this.header.id)!;
		this.title = document.getElementById(this.title.id)!;
		this.iconDiv = document.getElementById(this.iconDiv.id)!;

		this.closeButton = document.getElementById(this.closeButton.id)!;
		this.maximiseButton = document.getElementById(this.maximiseButton.id)!;
		this.minimiseButton = document.getElementById(this.minimiseButton.id)!;

		const headerPointerDown = (e: PointerEvent) => {
			this.#WindowSystem.target = {
				window: this,

				originX: this.position.left,
				originY: this.position.top,

				windowX: this.position.left,
				windowY: this.position.top,

				hasMoved: false
			};

			const rect = this.container.getBoundingClientRect();
			this.#WindowSystem.offsetX = e.clientX - rect.left;
			this.#WindowSystem.offsetY = e.clientY - rect.top;
			this.#WindowSystem.startMouseX = e.clientX;
			this.#WindowSystem.startMouseY = e.clientY;

			e.preventDefault();
		};
		this.header.addEventListener("pointerdown", headerPointerDown);

		const containerPointerDown = () =>
			this.#WindowSystem.focusWindow(this.winID);
		this.container.addEventListener("pointerdown", containerPointerDown);

		// buttons
		const closePointerDown = () => this.close();
		this.closeButton.addEventListener("pointerdown", closePointerDown);
		const fullscreenPointerDown = () => {
			if (this.fullscreened) {
				this.unfullscreen();
			} else {
				this.fullscreen();
			}
		};
		this.maximiseButton.addEventListener(
			"pointerdown",
			fullscreenPointerDown
		);

		const minimisePointerDown = () => this.minimise();
		this.minimiseButton.addEventListener(
			"pointerdown",
			minimisePointerDown
		);

		this.setIcon("app-window-mac");

		this.resizeObserver = new ResizeObserver(() => {
			const widthPx = this.container.style.width;
			const heightPx = this.container.style.height;

			const width = Number(widthPx.substring(0, widthPx.length - 2)) + 4;
			const height =
				Number(heightPx.substring(0, heightPx.length - 2)) + 4;

			this.resize(width, height);
			this.move(this.position.left, this.position.top, undefined, false);
		});

		this.resizeObserver.observe(this.container);
	}

	name: string;
	shortname?: string;
	container: HTMLElement;
	body: HTMLElement;
	header: HTMLElement;
	closeButton: HTMLElement;
	maximiseButton: HTMLElement;
	minimiseButton: HTMLElement;
	title: HTMLElement;
	iconDiv: HTMLElement;
	readonly winID: number;
	Application?: Application;
	resizeObserver: ResizeObserver;
	iconName: string = "app-window-mac";
	forcedZIndex?: number;

	reposition() {
		const start = performance.now();
		const c = this.container;

		const width = Number(c.dataset.width) - 4 + "px";
		const height = Number(c.dataset.height) - 4 + "px";

		const left = c.dataset.left + "px";
		const top = c.dataset.top + "px";

		// go to the back if invisible window
		const zIndex = this.visible ? String(c.dataset.zIndex) : "-1000";

		if (c.style.width !== width) {
			c.style.width = width;
		}
		if (c.style.height !== height) {
			c.style.height = height;
		}

		if (c.style.left !== left) {
			c.style.left = left;
		}
		if (c.style.top !== top) {
			c.style.top = top;
		}

		if (this.forcedZIndex == undefined) {
			if (c.style.zIndex !== zIndex) {
				c.style.zIndex = zIndex;
			}
		} else {
			if (c.style.zIndex !== String(this.forcedZIndex)) {
				c.style.zIndex = String(this.forcedZIndex);
			}
		}

		windowsTimestamp(`Reposition window ${this.winID}`, start);
	}

	/**
	 * Moves the window, whilst preventing it from moving offscreen.
	 * @param x - the X position of the window.
	 * @param y - the Y position of the window.
	 * @param z - the Z position of the window.
	 * @returns - Snapping information
	 */
	move(x?: number, y?: number, z?: number, unsnap: boolean = true) {
		if (this.lastResizeWasSnapping == true && unsnap == true) {
			// undo snapping size
			this.resize(this.unsnappedWidth, this.unsnappedHeight);

			this.lastResizeWasSnapping = false;

			this.unsnappedWidth = undefined;
			this.unsnappedHeight = undefined;
		}

		const clamped = {
			x: clamp(x, 0, window.innerWidth - this.dimensions.width),
			y: clamp(y, 0, window.innerHeight - this.dimensions.height)
		};

		if (x !== undefined) this.container.dataset.left = String(clamped.x);
		if (y !== undefined) this.container.dataset.top = String(clamped.y);
		if (z !== undefined) this.container.dataset.zIndex = String(z);

		if (x !== undefined) this.position.left = x;
		if (y !== undefined) this.position.top = y;
		if (z !== undefined) this.position.zIndex = z;

		this.reposition();

		return {
			snapLeft: clamped.x !== x && Number(x) < this.dimensions.width / 2,
			snapRight: clamped.x !== x && Number(x) > this.dimensions.width / 2,
			snapFullscreen: clamped.y !== y && Number(y) < 0
		};
	}

	lastResizeWasSnapping: boolean = false;
	unsnappedWidth?: number;
	unsnappedHeight?: number;
	resize(width = 100, height = 100, isSnapping?: boolean) {
		const clampedWidth = clamp(width, this.minimumWidth, Infinity);

		this.container.style.minWidth = `${clampedWidth}px`;

		this.container.dataset.width = String(clampedWidth);
		this.container.dataset.height = String(height);

		if (isSnapping) {
			this.lastResizeWasSnapping = true;
			this.unsnappedWidth = Number(this.dimensions.width);
			this.unsnappedHeight = Number(this.dimensions.height);
		}

		this.dimensions.width = clampedWidth;
		this.dimensions.height = height;

		this.reposition();
	}

	show() {
		this.container.classList.remove("invisible");
		this.visible = true;
	}

	hide() {
		this.container.classList.add("invisible");
		this.visible = false;
	}

	showHeader() {
		this.container.classList.remove("square");
	}
	hideHeader() {
		this.container.classList.add("square");
	}

	square() {
		this.container.classList.add("sqare");
	}
	unsquare() {
		this.container.classList.remove("sqare");
	}

	get minimised() {
		return this.container.classList.contains("gone");
	}
	set minimised(value: boolean) {
		if (value == true) {
			this.minimise();
		} else {
			this.unminimise();
		}
	}
	minimise() {
		this.unfullscreen();
		this.container.classList.add("gone");
	}
	unminimise() {
		this.container.classList.remove("gone");
	}

	fullscreen() {
		this.unminimise();
		this.container.classList.add("fullscreenedWindow");
	}
	unfullscreen() {
		this.container.classList.remove("fullscreenedWindow");

		// this is very broken.
		//this.container.classList.add("unfullscreeningWindow");
		//setTimeout(() => {
		//	this.container.classList.remove("unfullscreeningWindow");
		//}, 250);
	}
	get fullscreened() {
		return this.container.classList.contains("fullscreenedWindow");
	}
	set fullscreened(value: boolean) {
		if (value == true) {
			this.fullscreen();
		} else {
			this.unfullscreen();
		}
	}

	visible: boolean = true;

	dimensions = {
		width: 0,
		height: 0
	};
	position = {
		left: 0,
		top: 0,
		zIndex: 0
	};

	minimumWidth = 300;

	rename(name: string) {
		this.name = name;
		if (this.title.innerText !== name) {
			this.title.innerText = name;
		}
	}

	async setIcon(loc: string) {
		this.iconName = loc;

		const kernel = this.#ConstellationKernel;
		if (kernel.GraphicalInterface) {
			const icon = kernel.GraphicalInterface.getIcon(loc);

			this.#setIcon(icon);
		}
	}

	async #setIcon(element: HTMLElement) {
		element.style.width = "20px";
		element.style.height = "20px";

		element.style.left = "";
		element.style.top = "";
		this.iconDiv.innerHTML = element.outerHTML;
	}

	remove() {
		const start = performance.now();

		// animate the window's removal
		this.container.animate(
			[
				{},
				{
					transform: "scale(0.25)",
					filter: "blur(25px) opacity(0)"
				}
			],
			{
				duration: 150,
				easing: "ease-in"
			}
		);

		const del = () => {
			this.container.remove();

			const idx = this.#WindowSystem.windows.indexOf(this);

			this.#WindowSystem.windows.splice(idx, 1);

			this.#WindowSystem.updateWindows();

			windowsTimestamp(`Close Window ${this.winID}`, start);
		};

		if (this.winID == this.#WindowSystem.focusedWindow) {
			// we're focused and need to pass the focus onto another window
			const last = this.#WindowSystem.windows.length - 1;
			this.#WindowSystem.focusWindow(
				Math.max(0, Math.min(this.#WindowSystem.focusedWindow, last))
			);
		}

		setTimeout(del, 125);
	}

	close() {
		if (this.Application) {
			terminate(this.Application);
		}
	}
}

export class UserPrompt extends GraphicalWindowClass {
	constructor(
		ConstellationKernel: ConstellationKernel,
		name: string,
		width: number = 200
	) {
		super(ConstellationKernel, name);
		this.minimumWidth = 200;

		this.container.style.background =
			"rgb(from var(--backgroundColour) r g b / 50%)";
		this.container.style.backdropFilter = "blur(10px)";
		this.container.style.zIndex = "10000";
		this.forcedZIndex = 100000;

		this.hideHeader();

		// position windows where requested or at the default location
		const height: number = 200;

		const left = (window.innerWidth - width) / 2;
		const top = (window.innerHeight - height) / 2;

		this.resize(width, height);
		this.move(left, top);
	}
}
