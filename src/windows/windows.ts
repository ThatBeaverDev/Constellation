import { getIcon } from "../lib/icons.js";
import { Application } from "../apps/executables.js";
import { terminate } from "../apps/apps.js";
import * as css from "./cssVariables.js";

// constants

export const EDGE_THRESHOLD = 8;
export const minHeight = 25;
export const minWidth = 100;

export const windows: GraphicalWindow[] = [];
declare global {
	interface Window {
		windows: GraphicalWindow[];
	}
}
window.windows = windows;

// variables
export let minimiseAnimation = "flick";
export let focus: any;
export let target: GraphicalWindow | undefined = undefined;
let startMouseX = 0;
let startMouseY = 0;
let offsetX = 0;
let offsetY = 0;

let winID = 0;
export let windowTilingNumber = 0;

// init css styles
css.initialiseStyles();
export const setCSSVariable = css.setCSSVariable;

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

// event listeners

const windowPointerDown = (e: PointerEvent) => {
	// clear target if clicking outside windows
	if (!target) return;
	e.preventDefault();
};
window.addEventListener("pointerdown", windowPointerDown);

const windowPointerMove = (e: PointerEvent) => {
	if (!target) return;

	const x = e.clientX - offsetX;
	const y = e.clientY - offsetY;

	target.move(x, y);
};
window.addEventListener("pointermove", windowPointerMove);

// stop the dragging
const windowPointerUp = (e: PointerEvent) => {
	target = undefined;
};
window.addEventListener("pointerup", windowPointerUp);

window.addEventListener("resize", (e) => {
	updateWindows();
});

function windowButton(elem: HTMLElement, svg: string, scale: number = 1) {
	elem.className = "windowButton";

	const icon = getIcon(svg);
	icon.style.width = `calc(100% * ${scale})`;
	icon.style.height = `calc(100% * ${scale})`;

	const percent = Math.abs(100 - 100 * scale) / 2;

	icon.style.left = `${percent}%`;
	icon.style.top = `${percent}%`;

	elem.innerHTML = icon.outerHTML;
	elem.id = String(window.renderID++);

	return elem;
}

export class GraphicalWindow {
	constructor(name: string, Application: Application) {
		this.name = name;
		this.winID = winID++;
		this.Application = Application;

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
		this.iconDiv.style.width = "25px";
		this.iconDiv.style.height = "25px";

		this.closeButton = windowButton(document.createElement("div"), "x");
		this.maximiseButton = windowButton(
			document.createElement("div"),
			"maximize",
			0.75
		);
		this.minimiseButton = windowButton(
			document.createElement("div"),
			"minimize-2"
		);

		this.buttons = document.createElement("div");
		this.buttons.id = String(window.renderID++);
		this.buttons.className = "windowButtons";
		this.buttons.innerHTML =
			this.closeButton.outerHTML +
			this.minimiseButton.outerHTML +
			this.maximiseButton.outerHTML;

		this.header = document.createElement("div");
		const h = this.header;
		h.className = "windowHeader";
		h.id = String(window.renderID++);
		h.innerHTML =
			this.iconDiv.outerHTML +
			this.title.outerHTML +
			this.buttons.outerHTML;

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
			target = this;

			const rect = this.container.getBoundingClientRect();
			offsetX = e.clientX - rect.left;
			offsetY = e.clientY - rect.top;
			startMouseX = e.clientX;
			startMouseY = e.clientY;

			e.preventDefault();
		};
		this.header.addEventListener("pointerdown", headerPointerDown);

		const containerPointerDown = () => focusWindow(this.winID);
		this.container.addEventListener("pointerdown", containerPointerDown);

		// buttons
		const closePointerDown = () => this.close();
		this.closeButton.addEventListener("pointerdown", closePointerDown);

		const minimisePointerDown = () => this.minimise();
		this.minimiseButton.addEventListener(
			"pointerdown",
			minimisePointerDown
		);

		this.setIcon("app-window-mac");

		this.resizeObserver = new ResizeObserver(() => {
			const widthPx = this.container.style.width;
			const heightPx = this.container.style.height;

			const width = Number(widthPx.substring(0, widthPx.length - 2));
			const height = Number(heightPx.substring(0, heightPx.length - 2));

			this.resize(width, height);
			this.move(this.position.left, this.position.top);
		});

		this.resizeObserver.observe(this.container);

		focusWindow(this.winID);
	}

	name: string;
	container: HTMLElement;
	body: HTMLElement;
	header: HTMLElement;
	buttons: HTMLElement;
	closeButton: HTMLElement;
	maximiseButton: HTMLElement;
	minimiseButton: HTMLElement;
	title: HTMLElement;
	iconDiv: HTMLElement;
	winID: number;
	Application: Application;
	resizeObserver: ResizeObserver;
	iconName: string = "app-window-mac";

	reposition() {
		const c = this.container;

		const width = c.dataset.width + "px";
		const height = c.dataset.height + "px";

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
		if (c.style.zIndex !== zIndex) {
			c.style.zIndex = zIndex;
		}
	}

	move(x?: number, y?: number, z?: number) {
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
	}

	resize(width = 100, height = 100) {
		this.container.dataset.width = String(width);
		this.container.dataset.height = String(height);

		this.dimensions.width = width;
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
		this.header.style.height = "";
	}
	hideHeader() {
		this.header.style.height = "0px";
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
		this.container.classList.add("gone");
	}
	unminimise() {
		this.container.classList.remove("gone");
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

	rename(name: string) {
		this.name = name;
		if (this.title.innerText !== name) {
			this.title.innerText = name;
		}
	}

	async setIcon(loc: string) {
		this.iconName = loc;
		this._setIcon(getIcon(loc));
	}

	private async _setIcon(element: HTMLElement) {
		this.iconDiv.innerHTML = element.outerHTML;
	}

	remove() {
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
				duration: 500,
				easing: "ease-in"
			}
		);

		const del = () => {
			this.container.remove();
			windows.splice(this.winID, 1);

			// Reassign winIDs
			windows.forEach((win, i) => (win.winID = i));

			updateWindows();
		};

		setTimeout(del, 150);
	}

	close() {
		terminate(this.Application);
	}
}

function getWindowOfId(id: number) {
	for (const window of windows) {
		if (window.winID == id) {
			return window;
		}
	}
}

export function focusWindow(id: number) {
	const target = getWindowOfId(id);

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
	focus = id;
	target.container.classList.add("focused");
	target.move(
		target.position.left,
		target.position.top,
		windowTilingNumber++
	);
}

export function setMinimiseEffect(effect: string) {
	minimiseAnimation = String(effect);
}

function updateWindows() {
	let x = 0;
	let y = 0;

	const padding = 50;

	const availableWidth = window.innerWidth - padding;
	const availableHeight = window.innerHeight - padding;

	// get amount of windows which are visible.
	let totalWindows = 0;
	for (const win of windows) {
		if (win.visible) {
			totalWindows++;
		}
	}

	const windowHeaderHeight = 25;

	const blankSpace = totalWindows * windowHeaderHeight;
	const windowWidth = availableWidth - blankSpace;
	const windowHeight = availableHeight - blankSpace;

	windows.forEach((win, index) => {
		win.container.style.resize = "both";

		win.reposition();
	});
}

window.addEventListener("resize", () => updateWindows());

function preventBehavior(e: TouchEvent) {
	e.preventDefault();
}

document.addEventListener("touchmove", preventBehavior, { passive: false });

export function newWindow(title: string, ApplicationObject: Application) {
	const win = new GraphicalWindow(title, ApplicationObject);

	win.winID = windows.length; // assign ID before push
	windows.push(win);

	focusWindow(win.winID);

	updateWindows();

	return {
		id: win.winID,
		data: win
	};
}

let oldMinimiseAnimation: string | undefined; // undefined so that we definitely initialise the mode we are in.
export function reapplyStyles() {
	oldMinimiseAnimation = undefined;
}

const styleElem = document.createElement("style");
styleElem.id = String(window.renderID++);
styleElem.className = "windowsAnimationStyles";

document.body.appendChild(styleElem);
const live = document.getElementById(styleElem.id)!;
console.log(live);

async function updateLiveStyling() {
	const fnc = async () => {
		console.debug(
			"Loading windowing CSS for minimise animation: " + minimiseAnimation
		);

		const css = await env.fs.readFile(
			"/System/windows/" + minimiseAnimation + ".css"
		);

		if (!css.ok) {
			return;
		}
		if (css.data == undefined) {
			return;
		}

		console.debug(
			"CSS retrieved successfully for minimise animation: " +
				minimiseAnimation
		);

		live.textContent = css.data;
	};

	setTimeout(fnc, 500);
}

setInterval(() => {
	if (minimiseAnimation !== oldMinimiseAnimation) {
		oldMinimiseAnimation = String(minimiseAnimation);
		updateLiveStyling();
	}
});
