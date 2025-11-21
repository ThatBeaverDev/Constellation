import ConstellationKernel from "../../kernel.js";
import { GuiApplication } from "../../runtime/components/executables.js";
import WindowSystem from "./windowSystem.js";
import { windowsTimestamp } from "./timestamp.js";
import { GraphicalInterface } from "../gui.js";
import uiKitCreators from "../uiKit/components/creators.js";

export const path = "/System/gui/display/windowTypes.js";

export class GraphicalWindow {
	#WindowSystem: WindowSystem;
	#ConstellationKernel: ConstellationKernel;
	#GraphicalInterface: GraphicalInterface;

	// properties that change
	name: string;
	shortname?: string;
	title: HTMLElement;
	iconName: string = "app-window-mac";

	// HTML
	container: HTMLDivElement;
	body: HTMLDivElement;
	header: HTMLDivElement;
	buttonsDiv: HTMLDivElement;
	closeButton: HTMLElement;
	maximiseButton: HTMLElement;
	minimiseButton: HTMLElement;
	iconDiv: HTMLElement;

	// properties that don't change often
	layer: number = 100;
	readonly winID: number;
	Application?: GuiApplication;
	resizeObserver: ResizeObserver;
	isRemoved: boolean = false;

	constructor(
		ConstellationKernel: ConstellationKernel,
		name: string,
		Application?: GuiApplication
	) {
		this.#ConstellationKernel = ConstellationKernel;

		if (!(ConstellationKernel.ui.type == "GraphicalInterface"))
			throw new Error("Windows cannot exist on a non-graphical system.");

		this.#GraphicalInterface = ConstellationKernel.ui;

		const WindowSystem = ConstellationKernel.ui.windowSystem;
		this.#WindowSystem = WindowSystem;
		this.name = name;
		this.winID = WindowSystem.winID++;
		this.Application = Application;

		this.winID = WindowSystem.maxWinID++;
		WindowSystem.windows.push(this);

		// position windows where requested or at the default location
		const width: number = 1000;
		const height: number = 600;

		const left = (this.portWidth - width) / 2;
		const top = (this.portHeight - height) / 2;

		this.title = document.createElement("p");
		const t = this.title;
		t.className = "windowTitle";
		t.id = String(window.renderID++);
		t.innerText = name;

		// window icon
		this.iconDiv = document.createElement("div");
		this.iconDiv.id = String(window.renderID++);
		this.iconDiv.classList.add("windowIcon");

		const UiKitCreators = new uiKitCreators(ConstellationKernel, undefined);

		let right = 3;
		const windowButton = (iconpath: string) => {
			const button = document.createElement("div");
			button.id = String(window.renderID++);
			button.classList.add("windowButton");
			//button.style.right = `${right}px`;

			let icon: HTMLImageElement = UiKitCreators.uikitIcon(
				0,
				undefined,
				undefined,
				iconpath,
				1,
				"white",
				{}
			);
			icon.classList.add("windowButtonIcon");

			button.appendChild(icon);

			right += 23;

			return button;
		};

		this.buttonsDiv = document.createElement("div");
		this.buttonsDiv.classList.add("windowButtonContainer");

		this.closeButton = windowButton("x");
		this.minimiseButton = windowButton("minus");
		this.maximiseButton = windowButton("maximize");

		this.buttonsDiv.appendChild(this.minimiseButton);
		this.buttonsDiv.appendChild(this.maximiseButton);
		this.buttonsDiv.appendChild(this.closeButton);

		this.header = document.createElement("div");
		const h = this.header;
		h.className = "windowHeader";
		h.id = String(window.renderID++);

		// children
		h.appendChild(this.iconDiv);
		h.appendChild(this.title);
		h.appendChild(this.buttonsDiv);

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
		this.container.appendChild(this.header);
		this.container.appendChild(this.body);

		this.move(left, top);
		this.resize(width, height);

		const shadowRoot = ConstellationKernel.ui.shadowRoot;

		ConstellationKernel.ui.container.appendChild(this.container);

		this.closeButton = shadowRoot.getElementById(this.closeButton.id)!;
		this.maximiseButton = shadowRoot.getElementById(
			this.maximiseButton.id
		)!;
		this.minimiseButton = shadowRoot.getElementById(
			this.minimiseButton.id
		)!;

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
			this.move(this.position.left, this.position.top, false);
		});

		this.resizeObserver.observe(this.container);
	}

	get portWidth() {
		return this.#GraphicalInterface.displayWidth;
	}
	get portHeight() {
		return this.#GraphicalInterface.displayHeight;
	}

	reposition() {
		const scale = this.#GraphicalInterface.displayScaling;

		const start = performance.now();
		const c = this.container;

		const width = Number(c.dataset.width) - 4 + "px";
		const height = Number(c.dataset.height) - 4 + "px";

		const left = Number(c.dataset.left) / scale + "px";
		const top = Number(c.dataset.top) / scale + "px";

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

		const gui = this.#ConstellationKernel.ui;
		if (gui.type == "GraphicalInterface") gui.windowSystem.relayer();

		windowsTimestamp(`Reposition window ${this.winID}`, start);
	}

	/**
	 * Moves the window, whilst preventing it from moving offscreen.
	 * @param x - the X position of the window.
	 * @param y - the Y position of the window.
	 * @param z - the Z position of the window.
	 */
	move(x?: number, y?: number, unsnap: boolean = true) {
		if (this.lastResizeWasSnapping == true && unsnap == true) {
			// undo snapping size
			this.resize(this.unsnappedWidth, this.unsnappedHeight);

			this.lastResizeWasSnapping = false;

			this.unsnappedWidth = undefined;
			this.unsnappedHeight = undefined;
		}

		if (x !== undefined) this.container.dataset.left = String(x);
		if (y !== undefined) this.container.dataset.top = String(y);

		if (x !== undefined) this.position.left = x;
		if (y !== undefined) this.position.top = y;

		this.reposition();
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

		this.#unsnappedPosition = structuredClone(this.position);

		// snap it
		this.#WindowSystem.snappingWindow = {
			window: this,
			side: "fullscreen"
		};
	}

	#unsnappedPosition?: typeof this.position;

	unfullscreen() {
		if (!this.#unsnappedPosition) return;

		this.move(
			this.#unsnappedPosition.left,
			this.#unsnappedPosition.top,
			true
		);

		this.#unsnappedPosition = undefined;
	}
	get fullscreened() {
		return this.#unsnappedPosition !== undefined;
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
		top: 0
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
		if (kernel.ui.type == "GraphicalInterface") {
			const icon = kernel.ui.getIcon(loc);

			this.#setIcon(icon);
		}
	}

	async #setIcon(element: HTMLElement) {
		// css handles it
		element.style.width = "";
		element.style.height = "";

		element.style.left = "";
		element.style.top = "";
		this.iconDiv.innerHTML = element.outerHTML;
	}

	remove() {
		if (this.isRemoved == true) return;
		this.isRemoved = true;

		const start = performance.now();

		this.#ConstellationKernel.lib.logging.debug(
			path,
			"Closing window",
			this
		);

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
			if (this.Application) {
				this.#ConstellationKernel.runtime.terminateProcess(
					this.Application
				);
			}
			// insure we don't loop.
			this.Application = undefined;

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
		this.remove();
	}
}
// literally just a window that lives on the back layer.

export class UnderlayWindow extends GraphicalWindow {
	layer: number = 0;
}
export class OverlayWindow extends GraphicalWindow {
	layer: number = 200;
	#GraphicalInterface: GraphicalInterface;
	#WindowSystem: WindowSystem;

	constructor(
		ConstellationKernel: ConstellationKernel,
		name: string,
		Application?: GuiApplication,
		width: number = 1000,
		height: number = 600
	) {
		super(ConstellationKernel, name, Application);
		this.minimumWidth = 200;

		if (!(ConstellationKernel.ui.type == "GraphicalInterface"))
			throw new Error("Windows cannot exist on a non-graphical system.");

		this.#GraphicalInterface = ConstellationKernel.ui;

		const WindowSystem = this.#GraphicalInterface.windowSystem;
		this.#WindowSystem = WindowSystem;
		this.#WindowSystem.focusWindow(this.winID);

		this.container.classList.add("frosted");

		this.hideHeader();

		// position windows where requested or at the default location
		const left = (this.portWidth - width) / 2;
		const top = (this.portHeight - height) / 2;

		this.resize(width, height);
		this.move(left, top);
	}
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
