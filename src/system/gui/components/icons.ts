import { SystemFilesystemDriver } from "../../../fs/fs.js";
import ConstellationKernel from "../../kernel.js";

const path = "/System/gui/icons.js";

function isURL(url: string) {
	return (
		url.startsWith("http://") ||
		url.startsWith("https://") ||
		url.startsWith("data:")
	);
}

export class IconGenerator {
	cache: Record<string, HTMLImageElement> = {};
	div: HTMLDivElement;
	#ConstellationKernel: ConstellationKernel;
	fs: SystemFilesystemDriver;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
		this.fs = ConstellationKernel.fs;

		this.div = document.createElement("div");
		this.div.id = "lucideIconCache";

		const hidden = document.getElementsByClassName("hidden")[0];
		if (!hidden) {
			throw new Error("Hidden container not found.");
		}
		hidden.appendChild(this.div);
	}

	resetCache() {
		this.#ConstellationKernel.lib.logging.debug(path, "Resetting Cache...");
		this.cache = {};
	}

	get isDarkMode() {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			return true;
		} else {
			return false;
		}
	}

	get iconsPath():
		| "/Constellation-Sahara-Ares/assets/icons/dark/"
		| "/Constellation-Sahara-Ares/assets/icons/light/" {
		if (this.isDarkMode) {
			return "/Constellation-Sahara-Ares/assets/icons/dark/";
		} else {
			return "/Constellation-Sahara-Ares/assets/icons/light/";
		}
	}

	initIcon(name: string) {
		const icon = document.createElement("img");
		icon.dataset.type = name;
		icon.className = "uikitIcon";
		icon.src = this.iconsPath + name + ".svg";
		icon.id = String(window.renderID++);

		this.div.appendChild(icon);

		this.cache[name] = icon.cloneNode(true) as HTMLImageElement;
	}

	getIcon(providedName: string): HTMLImageElement {
		let name = String(providedName);

		const id = String(window.renderID++);
		const icon = document.createElement("img");

		icon.id = id;
		icon.className = "uikitIcon";
		icon.width = 24;
		icon.height = 24;
		icon.alt = name;

		const finalIcon = this.#applyIcon(icon, id, name);

		return finalIcon;
	}

	#applyIcon(icon: HTMLImageElement, id: string, name: string) {
		if (name == "") {
			// literally just an empty SVG.
			icon.src =
				"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==";

			return icon;
		} else if (name[0] == "/" || isURL(name)) {
			if (!this.cache[name]) {
				// load from url or fs
				icon.dataset.directory = name;
				icon.src = ""; // placeholder
				this.#applySourceAndCache(icon, name);
			} else {
				const clone = this.cache[name].cloneNode(
					true
				) as HTMLImageElement;
				clone.id = id;
				clone.className = icon.className;
				return clone;
			}
		} else {
			// lucide
			if (!this.cache[name]) this.initIcon(name);
			const clone = this.cache[name].cloneNode(true) as HTMLImageElement;
			clone.id = id;
			clone.className = icon.className;
			return clone;
		}

		return icon;
	}

	async #applySourceAndCache(icon: HTMLImageElement, directory: string) {
		const clone = icon.cloneNode(true) as HTMLImageElement;

		if (isURL(directory)) {
			icon.src = directory;
			clone.src = directory;

			// cache a clone once loaded.
			clone.addEventListener("load", () => {
				this.cache[directory] = clone.cloneNode(
					true
				) as HTMLImageElement;
			});
			return;
		}

		const content = await this.fs.readFile(directory);
		if (content == undefined) {
			this.#ConstellationKernel.lib.logging.warn(
				path,
				`Failed to load icon from ${directory}:`,
				content
			);
			icon.alt = "[!]";
			clone.alt = "[!]";

			// cache a clone once loaded.
			clone.addEventListener("load", () => {
				this.cache[directory] = clone.cloneNode(
					true
				) as HTMLImageElement;
			});

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
			this.cache[directory] = clone.cloneNode(true) as HTMLImageElement;
		});
	}

	async terminate() {
		this.div.remove();
	}
}
