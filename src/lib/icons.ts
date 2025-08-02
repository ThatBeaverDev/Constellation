import fs from "../io/fs.js";

const div = document.createElement("div");
div.id = "lucideIconCache";

const hidden = document.getElementsByClassName("hidden")[0];
if (!hidden) {
	throw new Error("Hidden container not found.");
}
hidden.appendChild(div);

const cache: Record<string, HTMLImageElement> = {};

function initIcon(name: string) {
	const icon = document.createElement("img");
	icon.dataset.type = name;
	icon.className = "uikitIcon";
	icon.src = "/icons/icons/" + name + ".svg";
	icon.id = String(window.renderID++);

	div.appendChild(icon);

	cache[name] = icon;
}

export function getIcon(name: string): HTMLImageElement {
	const id = String(window.renderID++);
	const icon = document.createElement("img");

	icon.id = id;
	icon.className = "uikitIcon";
	icon.width = 24;
	icon.height = 24;
	icon.alt = name;

	if (name[0] == "/" || name.startsWith("http")) {
		if (!cache[name]) {
			// load from url or fs
			icon.dataset.directory = name;
			icon.src = ""; // placeholder
			applySourceAndCache(icon, name);
		} else {
			const clone = cache[name].cloneNode(true) as HTMLImageElement;
			clone.id = id;
			clone.className = icon.className;
			return clone;
		}
	} else {
		// cached
		if (!cache[name]) initIcon(name);
		const clone = cache[name].cloneNode(true) as HTMLImageElement;
		clone.id = id;
		clone.className = icon.className;
		return clone;
	}

	return icon;
}

async function applySourceAndCache(icon: HTMLImageElement, directory: string) {
	const content = await fs.readFile(directory);
	if (content == undefined) {
		console.warn(`Failed to load icon from ${directory}:`, content);
		icon.alt = "[!]";

		// cache a clone once loaded.
		icon.addEventListener("load", () => {
			cache[directory] = icon.cloneNode(true) as HTMLImageElement;
		});

		return;
	}

	if (directory.startsWith("http://") || directory.startsWith("https://")) {
		icon.src = directory;
		return;
	}

	const type = directory.textAfterAll(".");
	switch (type) {
		case "svg": {
			const base64 = btoa(content);
			icon.src = `data:image/svg+xml;base64,${base64}`;
			break;
		}
		default:
			icon.src = content; // fallback to text
	}

	// cache a clone once loaded.
	icon.addEventListener("load", () => {
		cache[directory] = icon.cloneNode(true) as HTMLImageElement;
	});
}
