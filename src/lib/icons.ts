export const icons = {};

const div = document.createElement("div");
div.id = "lucideIconCache";

document.getElementsByClassName("hidden")[0].appendChild(div);

const cache: any = {};

function initIcon(name: string) {
	const icon = document.createElement("img");
	icon.dataset.type = name;
	icon.className = "uikitIcon";
	icon.src = "/icons/icons/" + name + ".svg";
	icon.id = String(window.renderID++);

	div.appendChild(icon);

	cache[name] = document.getElementById(icon.id)!;
}

export function getIcon(name: string): HTMLElement {
	let icon: HTMLImageElement;
	const id = String(window.renderID++);
	if (name[0] == "/") {
		// this is a path, which must be loaded.

		icon = document.createElement("img");
		icon.dataset.directory = name;
		icon.className = "uikitIcon";

		// async function called in a syncronous function, this continues after the initial call.
		applySource(id, name);
	} else {
		// this is a lucide icon.
		if (cache[name] == undefined) {
			initIcon(name);
		}

		icon = cache[name].cloneNode(true);
	}

	icon.id = id;
	icon.alt = name;

	return icon;
}

async function applySource(id: string, directory: string) {
	const content = await env.fs.readFile(directory);

	if (!content.ok) {
		throw content.data;
	}

	const base64 = btoa(content.data);

	const dataURI = "data:image/svg+xml;base64," + base64;

	// @ts-expect-error // this will return an image element, trust me.
	const icon: HTMLImageElement = document.getElementById(id);

	try {
		icon.src = dataURI;
	} catch (e) {
		// no error will be thrown.
	}
}
