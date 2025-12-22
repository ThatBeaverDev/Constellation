import { SystemFilesystemDriver } from "../../../fs/fs.js";
import ConstellationKernel from "../../kernel.js";

const path = "/System/gui/images.js";

export class ImageGenerator {
	cache: Record<string, HTMLImageElement> = {};
	#ConstellationKernel: ConstellationKernel;
	fs: SystemFilesystemDriver;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
		this.fs = ConstellationKernel.fs;
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

	getImage(location: string): HTMLImageElement {
		let name = String(location);

		const id = String(window.renderID++);
		const image = document.createElement("img");

		image.id = id;
		image.className = "uikitImage";

		image.alt = name;

		const finalImage = this.#applyImage(image, id, name);

		return finalImage;
	}

	#applyImage(image: HTMLImageElement, id: string, location: string) {
		if (location == "") {
			// literally just an empty SVG.
			image.src =
				"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==";
			return image;
		}

		if (!this.cache[location]) {
			// load from url or fs
			image.dataset.directory = location;
			image.src = ""; // placeholder
			this.#applySourceAndCache(image, location);
		} else {
			// use the cache
			const clone = this.cache[location].cloneNode(
				true
			) as HTMLImageElement;
			clone.id = id;
			clone.className = image.className;
			return clone;
		}

		return image;
	}

	async #applySourceAndCache(image: HTMLImageElement, location: string) {
		const clone = image.cloneNode(true) as HTMLImageElement;

		const isURL =
			location.startsWith("http://") ||
			location.startsWith("https://") ||
			location.startsWith("data:");

		if (isURL) {
			/* ---------- URL ---------- */
			image.src = location;
			clone.src = location;

			// cache a clone once loaded.
			clone.addEventListener("load", () => {
				this.cache[location] = clone.cloneNode(
					true
				) as HTMLImageElement;
			});
		} else {
			/* ---------- File ---------- */
			const content = await this.fs.readFile(location);
			if (content == undefined) {
				this.#ConstellationKernel.lib.logging.warn(
					path,
					`Failed to load image from ${location} because it does not exist:`,
					content
				);
				image.alt = "[!]";
				clone.alt = "[!]";

				// cache a clone once loaded.
				clone.addEventListener("load", () => {
					this.cache[location] = clone.cloneNode(
						true
					) as HTMLImageElement;
				});

				return;
			}

			const type = location.textAfterAll(".");
			switch (type) {
				case "svg": {
					const base64 = btoa(content);
					image.src = `data:image/svg+xml;base64,${base64}`;
					clone.src = `data:image/svg+xml;base64,${base64}`;
					break;
				}
				default:
					image.src = content; // fallback to text
					clone.src = content;
			}

			// cache clone once loaded
			clone.addEventListener("load", () => {
				this.cache[location] = clone.cloneNode(
					true
				) as HTMLImageElement;
			});
		}
	}

	async terminate() {
		this.resetCache();
	}
}
