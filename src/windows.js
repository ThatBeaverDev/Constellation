import { getIcon } from "./lib/lucide.js";
import conf from "../constellation.config.js";

// variables
const vars = {
	"wallpaper-url": `url("${conf.wallpaper}")`
};

// construct css
let css = ":root {";
for (const i in vars) {
	const t = "--" + i + ": " + vars[i] + ";";
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

export const windows = [];
export let focus;

export function init() {}

export function newWindow(name, options = {}) {
	const id = windows.push(new Window(name, options));
	return {
		id,
		data: windows.at(-1)
	};
}

export let action = undefined; // move or resize
export let target = undefined;
export let actionInfo = undefined;
export const targetingDrag = false;

let oldmsX = 0;
let oldmsY = 0;
let msX = 0;
let msY = 0;
let xDiff = 0;
let yDiff = 0;
window.addEventListener("mousemove", (event) => {
	//if (xDiff !== 0 || yDiff !== 0) {
	//	return;
	//}

	oldmsX = Number(msX);
	oldmsY = Number(msY);

	msX = Number(event.clientX);
	msY = Number(event.clientY);

	xDiff = Number(msX) - Number(oldmsX);
	yDiff = Number(oldmsY) - Number(msY);
});

function windowButton(elem, svg) {
	elem.className = "windowButton";

	const icon = getIcon(svg);
	icon.style.width = "100%";
	icon.style.height = "100%";

	elem.innerHTML = icon.outerHTML;
	elem.id = window.renderID++;

	return elem;
}

export class Window {
	constructor(name, options) {
		this.name = name;

		// position windows where requested or at the default location
		const width = options.width == undefined ? 500 : options.width;
		const height = options.height == undefined ? 300 : options.height;
		const left = options.left == undefined ? (window.innerWidth - width) / 2 : options.left;
		const top = options.top == undefined ? (window.innerHeight - height) / 2 : options.top;

		this.buttons = {
			div: document.createElement("div"),
			fullscreen: windowButton(document.createElement("div"), "maximize"),
			close: windowButton(document.createElement("div"), "x")
		};

		this.buttons.div.className = "windowButtons";
		this.buttons.div.innerHTML = this.buttons.close.outerHTML + this.buttons.fullscreen.outerHTML;

		this.title = document.createElement("p");
		const t = this.title;
		t.className = "windowTitle";
		t.id = window.renderID++;
		t.innerText = name;

		this.header = document.createElement("div");
		const h = this.header;
		h.className = "windowHeader";
		h.id = window.renderID++;
		h.innerHTML = this.title.outerHTML + this.buttons.div.outerHTML;

		this.body = document.createElement("div");
		const b = this.body;
		b.className = "windowBody";
		b.id = window.renderID++;
		this.body.innerHTML = options.html || "";

		// container
		this.container = document.createElement("div");
		const c = this.container;
		c.className = "windowContainer";
		c.id = window.renderID++;
		c.dataset.width = width;
		c.dataset.height = height;
		c.dataset.left = left;
		c.dataset.top = top;
		this.container.innerHTML = this.header.outerHTML + this.body.outerHTML;

		this.reposition = () => {
			const c = this.container;

			const width = c.dataset.width + "px";
			const height = c.dataset.height + "px";

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
		};

		this.reposition();

		document.body.appendChild(this.container);

		this.container = document.getElementById(this.container.id);
		this.body = document.getElementById(this.body.id);
		this.header = document.getElementById(this.header.id);
		this.title = document.getElementById(this.title.id);
		this.buttons = {
			close: document.getElementById(this.buttons.close.id),
			fullscreen: document.getElementById(this.buttons.fullscreen.id)
		};

		this.header.addEventListener("mousedown", (event) => {
			if (event.button == 0) {
				if (targetingDrag == false) {
					target = this;
					action = "move";
				}
			}
		});

		this.mouseState = undefined;

		this.container.addEventListener("mousedown", () => {
			if (this.mouseState !== undefined) {
				// the mouse is in a drag location
				action = "resize";
				actionInfo = this.mouseState;
				target = this;
			}
		});
	}

	move(x = 0, y = 0) {
		this.container.dataset.left = x;
		this.container.dataset.top = y;
		this.reposition();
	}

	resize(width = 100, height = 100) {
		this.container.dataset.width = width;
		this.container.dataset.height = height;

		this.dimensions.width = width;
		this.dimensions.height = height;

		this.reposition();
	}

	dimensions = {
		width: 0,
		height: 0
	};

	remove() {
		this.container.remove();
	}
}

const resize = (dragger = actionInfo) => {
	switch (dragger) {
		case "top":
			target.container.dataset.height = Number(target.container.dataset.height) + yDiff;
			target.container.dataset.top = Number(target.container.dataset.top) - yDiff;
			break;
		case "bottom":
			target.container.dataset.height = Number(target.container.dataset.height) - yDiff;
			break;
		case "left":
			target.container.dataset.left = Number(target.container.dataset.left) + xDiff;
			target.container.dataset.width = Number(target.container.dataset.width) - xDiff;
			break;
		case "right":
			target.container.dataset.width = Number(target.container.dataset.width) + xDiff;
			break;
		case "bottomRight":
			resize("bottom");
			resize("right");
			break;
		case "bottomLeft":
			resize("bottom");
			resize("left");
			break;
		case "topRight":
			resize("top");
			resize("right");
			break;
		case "topLeft":
			resize("top");
			resize("left");
			break;
		default:
			throw new Error("Unknown dragger: " + dragger);
	}
};

setInterval(() => {
	if (target == undefined) {
		document.body.style.cursor = undefined;
		return;
	}

	target.container.dataset.left = Number(target.container.dataset.left);
	target.container.dataset.top = Number(target.container.dataset.top);
	target.container.dataset.width = Number(target.container.dataset.width);
	target.container.dataset.height = Number(target.container.dataset.height);

	switch (action) {
		case "move":
			target.container.dataset.left = Number(target.container.dataset.left) + xDiff;
			target.container.dataset.top = Number(target.container.dataset.top) - yDiff;

			break;
		case "resize":
			resize(actionInfo);
			break;
	}

	xDiff = 0;
	yDiff = 0;
	target.reposition();
});

document.addEventListener("mouseup", () => {
	target = undefined;
	action = undefined;
	actionInfo = undefined;
});
