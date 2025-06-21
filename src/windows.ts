import fs from "./fs.js";
import { getIcon } from "./lib/lucide.js";
import conf from "./constellation.config.js";
import { Application } from "./apps/processes.js";

// variables
const vars = {
	"wallpaper-url": `url("${conf.wallpaper}")`
};

// construct css
let css = ":root {";
for (const [key, value] of Object.entries(vars)) {
	const t = "--" + key + ": " + value + ";";
	css += t;
}
css += "}";

// construct style element
const style = document.createElement("style");
style.textContent = css;

// add to body
document.body.appendChild(style);

// windowing
export const EDGE_THRESHOLD = 8;

export const minHeight = 25;
export const minWidth = 100;

export let focus: any;

export function init() {}

let winID = 0;
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
		this.icon = getIcon("app-window");
		const i = this.icon;
		i.classList.add("windowIcon");
		i.classList.add("uikitIcon");
		i.id = String(window.renderID++);
		i.style.position = "static";

		this.header = document.createElement("div");
		const h = this.header;
		h.className = "windowHeader";
		h.id = String(window.renderID++);
		h.innerHTML = this.icon.outerHTML + this.title.outerHTML;

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

		this.reposition();

		document.body.appendChild(this.container);

		this.container = document.getElementById(this.container.id)!;
		this.body = document.getElementById(this.body.id)!;
		this.header = document.getElementById(this.header.id)!;
		this.title = document.getElementById(this.title.id)!;
	}

	name: string;
	container: HTMLElement;
	body: HTMLElement;
	header: HTMLElement;
	title: HTMLElement;
	icon: HTMLElement;
	mouseState: any;
	winID: number;
	Application: Application;

	reposition() {
		const c = this.container;

		const width = c.dataset.width + "px";
		const height = c.dataset.height + "px";

		this.dimensions.width = Number(c.dataset.width);
		this.dimensions.height = Number(c.dataset.height);

		const left = c.dataset.left + "px";
		const top = c.dataset.top + "px";

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
	}

	move(x = 0, y = 0) {
		this.container.dataset.left = String(x);
		this.container.dataset.top = String(y);
		this.reposition();
	}

	resize(width = 100, height = 100) {
		this.container.dataset.width = String(width);
		this.container.dataset.height = String(height);

		this.dimensions.width = width;
		this.dimensions.height = height;

		this.reposition();
	}

	dimensions = {
		width: 0,
		height: 0
	};

	rename(name: string) {
		this.name = name;
		if (this.title.innerText !== name) {
			this.title.innerText = name;
		}
	}

	async setIcon(svg: string) {
		const content = await fs.readFile(svg);

		this.icon.innerHTML = content;
	}

	// Modify Window.remove() to trigger layout update:
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

			layoutTiling();
		};

		setTimeout(del, 150);
	}
}

export const windows: Window[] = [];

export let focusKey: string = "altKey";

document.addEventListener("keydown", (e) => {
	// @ts-expect-error
	if (e[focusKey] !== true) {
		return;
	}

	switch (e.code) {
		case "ArrowLeft":
			// Left!
			focusWindow(focus - 1);
			break;
		case "ArrowRight":
			// Right!
			focusWindow(focus + 1);
			break;
		case "KeyW":
			// Close!
			const win = windows[focus];
			console.log(win);
	}
});

function focusWindow(id: number) {
	if (windows[id] == undefined) {
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
	const win = windows[id];
	win.container.classList.add("focused");
}

// Add this function anywhere appropriate (e.g., near `newWindow`)
function layoutTiling() {
	const cols = Math.ceil(Math.sqrt(windows.length));
	const rows = Math.ceil(windows.length / cols);

	const cellWidth = Math.floor(window.innerWidth / cols);
	const cellHeight = Math.floor(window.innerHeight / rows);

	windows.forEach((win, index) => {
		const col = index % cols;
		const row = Math.floor(index / cols);

		const left = col * cellWidth;
		const top = row * cellHeight;

		win.move(left, top);
		win.resize(cellWidth, cellHeight);
	});
}

window.addEventListener("resize", layoutTiling);

export function newWindow(name: string, Application: Application) {
	const win = new Window(name, Application);

	win.winID = windows.length; // assign ID before push
	windows.push(win);

	focusWindow(win.winID);

	layoutTiling();

	return {
		id: win.winID,
		data: win
	};
}
