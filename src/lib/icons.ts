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

	cache[name] = icon.cloneNode(true) as HTMLImageElement;
}

const iconsDirectory = "/System/CoreAssets/Vectors/icons";
let iconsList: string[] = [];
setInterval(async () => {
	const result = await fs.readdir(iconsDirectory);

	if (result !== undefined) {
		iconsList = result;
	}
}, 1000);

export function getIcon(providedName: string): HTMLImageElement {
	let name = String(providedName);
	const existsLocally = iconsList.includes(name + ".svg");
	if (existsLocally) {
		name = fs.resolve(iconsDirectory, name + ".svg");
	}

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
		// lucide
		console.warn("Geticon for lucide icon " + name);
		if (!cache[name]) initIcon(name);
		const clone = cache[name].cloneNode(true) as HTMLImageElement;
		clone.id = id;
		clone.className = icon.className;
		return clone;
	}

	return icon;
}

async function applySourceAndCache(icon: HTMLImageElement, directory: string) {
	const clone = icon.cloneNode(true) as HTMLImageElement;

	const content = await fs.readFile(directory);
	if (content == undefined) {
		console.warn(`Failed to load icon from ${directory}:`, content);
		icon.alt = "[!]";
		clone.alt = "[!]";

		// cache a clone once loaded.
		clone.addEventListener("load", () => {
			cache[directory] = clone.cloneNode(true) as HTMLImageElement;
		});

		return;
	}

	if (directory.startsWith("http://") || directory.startsWith("https://")) {
		icon.src = directory;
		clone.src = directory;
		return;
	}

	const type = directory.textAfterAll(".");
	switch (type) {
		case "svg": {
			const base64 = btoa(content);
			icon.src = `data:image/svg+xml;base64,${base64}`;
			clone.src = `data:image/svg+xml;base64,${base64}`;
			break;
		}
		default:
			icon.src = content; // fallback to text
			clone.src = content;
	}

	// cache a clone once loaded. // this was the site of a bug, wherein uiKit modified the icon it requested BEFORE it was cached. the uiKit changes were cached and applied elsewhere. 🤦 (solved by caching the icon before we wait for the readFile.)
	clone.addEventListener("load", () => {
		cache[directory] = clone.cloneNode(true) as HTMLImageElement;
	});
}
