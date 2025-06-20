export const icons = {};

const div = document.createElement("div");
div.id = "lucideIconCache";

document.getElementsByClassName("hidden")[0].appendChild(div);

const cache: any = {};

async function initIcon(name: string) {
	cache[name] = false;

	const req = await fetch("/icons/icons/" + name + ".svg");

	const svg = await req.text();

	console.log(svg);

	cache[name] = svg;
}

export function getIcon(name: string): HTMLElement {
	if (typeof cache[name] !== "string") {
		// if it's false, it's being loaded.
		if (cache[name] !== false) {
			cache[name] = initIcon(name);
		}

		return document.createElement("svg");
	}

	// @ts-ignore
	const inner = cache[name];

	const icon: HTMLElement = document.createElement("svg");
	icon.innerHTML = inner;

	icon.id = String(window.renderID++);
	icon.className = "uikitIcon";

	return icon;
}
