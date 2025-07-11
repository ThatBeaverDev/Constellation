import { getIcon } from "../lib/icons.js";
import { Application } from "../apps/executables.js";
import { terminate } from "../apps/apps.js";
import * as css from "./cssVariables.js";

// constants
export const EDGE_THRESHOLD = 8;
export let windowTiling = false;

export const minHeight = 25;
export const minWidth = 100;

export let focus: any;
export let target: Window | undefined = undefined;

export const windows: Window[] = [];
// @ts-expect-error
window.windows = windows;

// others
let diffX: number = 0;
let diffY: number = 0;
let oldX: number;
let oldY: number;

let winID = 0;

export let windowTilingNumber = 0;

// init css styles
css.initialiseStyles();
export const setCSSVariable = css.setCSSVariable;

export function setWindowTilingMode(enabled: boolean) {
	if (typeof windowTiling !== "boolean")
		throw new Error("input was not of type boolean.");

	windowTiling = enabled;
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

// event listeners
window.addEventListener("mousemove", (e) => {
	if (diffX !== 0 && diffY !== 0) return; // insure the dragged window has recieved the movement before resetting it

	const x = e.clientX;
	const y = e.clientY;

	if (oldX == undefined) oldX = x;
	if (oldY == undefined) oldY = y;

	diffX = x - oldX;
	diffY = y - oldY;

	oldX = x;
	oldY = y;
});
window.addEventListener("mousedown", (e) => {
	diffX = 0;
	diffY = 0;
}); // stop the first drag from snapping to the top left
window.addEventListener("mouseup", (e) => (target = undefined)); // stop the dragging
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

export class Window {
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

		this.buttons = document.createElement("div");
		this.buttons.id = String(window.renderID++);
		this.buttons.className = "windowButtons";
		this.buttons.innerHTML =
			this.closeButton.outerHTML + this.maximiseButton.outerHTML;

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

		this.header.addEventListener("mousedown", (e) => {
			target = this;
		});
		this.container.addEventListener("mousedown", (e) => {
			focusWindow(this.winID);
		});

		// buttons
		this.closeButton.addEventListener("mousedown", (e) => {
			terminate(this.Application);
		});

		const icon = getIcon("app-window-mac");
		this.setIcon(icon);

		this.resizeObserver = new ResizeObserver(() => {
			const widthPx = this.container.style.width;
			const heightPx = this.container.style.height;

			const width = Number(widthPx.substring(0, widthPx.length - 2));
			const height = Number(heightPx.substring(0, heightPx.length - 2));

			this.resize(width, height);
			this.move(this.position.left, this.position.top);
		});

		this.resizeObserver.observe(this.container);
	}

	name: string;
	container: HTMLElement;
	body: HTMLElement;
	header: HTMLElement;
	buttons: HTMLElement;
	closeButton: HTMLElement;
	maximiseButton: HTMLElement;
	title: HTMLElement;
	iconDiv: HTMLElement;
	winID: number;
	Application: Application;
	resizeObserver: ResizeObserver;

	resizable: boolean = true;

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

	async setIcon(element: HTMLElement) {
		this.iconDiv.innerHTML = element.outerHTML;
	}

	remove() {
		// animate the window's removal
		this.container.animate(
			[
				{},
				{
					transform: "scale(0.5)",
					filter: "blur(5px) opacity(0)"
				}
			],
			{
				duration: 200,
				easing: "cubic-bezier(0.67, 0.2, 0.58, 1.2)"
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

// Add this function anywhere appropriate (e.g., near `newWindow`)
function updateWindows(newTilingConfig: boolean = false) {
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
		win.container.style.resize =
			windowTiling && !win.resizable ? "none" : "both";

		if (
			newTilingConfig == true &&
			windowTiling &&
			!win.resizable &&
			win.visible
		) {
			win.move(padding + x, padding + y, index);
			win.resize(windowWidth, windowHeight);

			x += windowHeaderHeight;
			y += windowHeaderHeight;
		}

		win.reposition();
	});

	// window tiling features
	if (!windowTiling) return;

	const cols = Math.ceil(Math.sqrt(totalWindows));
	const rows = Math.ceil(totalWindows / cols);

	const cellWidth = Math.floor(window.innerWidth / cols);
	const cellHeight = Math.floor(window.innerHeight / rows);

	windows.forEach((win, index) => {
		// don't tile invisible windows.
		if (!win.visible || !win.resizable) return;

		const col = index % cols;
		const row = Math.floor(index / cols);

		const left = col * cellWidth;
		const top = row * cellHeight;

		win.move(left, top);
		win.resize(cellWidth, cellHeight);
	});
}

window.addEventListener("resize", () => updateWindows());

export function newWindow(title: string, ApplicationObject: Application) {
	const win = new Window(title, ApplicationObject);

	win.winID = windows.length; // assign ID before push
	windows.push(win);

	focusWindow(win.winID);

	updateWindows();

	return {
		id: win.winID,
		data: win
	};
}

let lastKnownWindowMode: boolean | undefined; // undefined so that we definitely initialise the mode we are in.
export function reapplyStyles() {
	lastKnownWindowMode = undefined;
}

const styleElem = document.createElement("style");
styleElem.id = String(window.renderID++);

document.body.appendChild(styleElem);
const live = document.getElementById(styleElem.id)!;

async function updateLiveStyling() {
	const fnc = async () => {
		const styleType = windowTiling ? "tiling" : "floating";

		console.debug("Loading windowing CSS for mode: " + styleType);

		const css = await env.fs.readFile(
			"/System/windows/" + styleType + ".css"
		);

		if (!css.ok) {
			return;
		}
		if (css.data == undefined) {
			return;
		}

		console.debug("CSS retrieved successfully for mode: " + styleType);

		live.textContent = css.data;
	};

	if (windowTiling) {
		await fnc();
	} else {
		setTimeout(fnc, 500);
	}

	updateWindows(true);
}

setInterval(() => {
	if (lastKnownWindowMode !== windowTiling) {
		updateLiveStyling();
		lastKnownWindowMode = windowTiling;
	}

	if (target !== undefined && !windowTiling && target?.resizable == true) {
		const pos = structuredClone(target.position);

		pos.left += diffX;
		pos.top += diffY;

		target.move(pos.left, pos.top);
	}

	diffX = 0;
	diffY = 0;
});
