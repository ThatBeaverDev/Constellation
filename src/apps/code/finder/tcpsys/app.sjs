const fsDisplayLib = await env.include("/System/CoreLibraries/pathicon.sjs");

const mod = (n, modulus) => {
	let result = n % modulus;
	if (result / modulus < 0) result += modulus;
	return result;
};
const clamp = (n, min, max) => {
	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}

	return n;
};

export default class finder extends Application {
	textWidth(text) {
		return this.renderer.getTextWidth(text, 15, "monospace");
	}

	writeText(text) {
		this.renderer.text(this.x, 3, text);

		// padding
		this.x += this.textWidth(text);
		this.x += this.padding;
	}

	drawIcon(name) {
		this.renderer.icon(this.x, 0, name);

		// padding
		this.x += 24;
		this.x += this.padding;
	}

	drawButton(text, callback) {
		this.renderer.button(this.x, 3, text, callback);

		// padding
		this.x += this.textWidth(text);
		this.x += this.padding;
	}

	async init() {
		this.padding = 1;

		await this.cd("/");

		this.renderer.window.rename("Finder");

		this.registerKeyboardShortcut("Scroll Down", "ArrowDown", []);
		this.registerKeyboardShortcut("Scroll Down (Fast)", "ArrowDown", ["ShiftLeft"]);
		this.registerKeyboardShortcut("Scroll Up", "ArrowUp", []);
		this.registerKeyboardShortcut("Scroll Up (Fast)", "ArrowUp", ["ShiftLeft"]);
		this.registerKeyboardShortcut("Descend Directory", "Enter", []);
		this.registerKeyboardShortcut("Ascend Directory", "Escape", []);
		this.registerKeyboardShortcut("Select Directory", "KeyG", ["AltLeft"]);

		this.keyLocations = {
			Constellation: "/",
			System: "/System",
			Users: "/Users"
		};

		setInterval(() => {
			this.cd(this.path);
		}, 500);
	}

	onmessage(origin, intent) {
		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-Scroll Down":
						this.selector = clamp(this.selector + 1, 0, this.listing.length - 1);
						break;
					case "keyboardShortcutTrigger-Scroll Down (Fast)":
						this.selector = clamp(this.selector + 2, 0, this.listing.length - 1);
						break;
					case "keyboardShortcutTrigger-Scroll Up":
						this.selector = clamp(this.selector - 1, 0, this.listing.length - 1);
						break;
					case "keyboardShortcutTrigger-Scroll Up (Fast)":
						this.selector = clamp(this.selector - 2, 0, this.listing.length - 1);
						break;
					case "keyboardShortcutTrigger-Descend Directory":
						const obj = this.listing[this.selector];
						this.cd(obj.path);
						this.selector = undefined;
						break;
					case "keyboardShortcutTrigger-Ascend Directory":
						this.selector = 0;
						this.cd("..");
						break;
					case "keyboardShortcutTrigger-Select Directory":
						this.cd(prompt("Select a directory"));
						break;
					default:
						throw new Error("Unknown keyboard shortcut name (intent): " + intent);
				}
				break;
			default:
				console.warn("Unknown message sender: " + origin);
		}
	}

	async cd(directory) {
		const oldDir = String(this.path);

		this.path = env.fs.relative(this.path, directory);
		const dir = this.path;
		if (this.path == "/") {
			this.location = "Constellation";
		} else {
			this.location = "Constellation" + String(this.path).replaceAll("/", " > ");
		}

		const list = await env.fs.listDirectory(dir);
		if (!list.ok) {
			this.path = oldDir;
			return;
		}

		this.listing = list.data;
		if (dir !== "/") {
			this.listing = ["..", ...this.listing];
		}

		this.listing.sort();

		this.listing = this.listing.map((name) => {
			const obj = {};
			obj.name = name;
			obj.path = env.fs.relative(this.path, name);
			obj.icon = fsDisplayLib.pathIcon(obj.path);

			return obj;
		});

		const newIcon = await fsDisplayLib.pathIcon(this.path);
		if (newIcon !== this.icon) {
			this.icon = newIcon;
			this.renderer.setWindowIcon(this.icon);
		}
	}

	async frame() {
		try {
			if (this.selector == undefined) {
				this.selector = 0;
			}

			this.renderer.clear();

			if (this.listing == undefined) {
				return;
			}

			this.renderer.icon(20, 0, await this.icon);
			this.renderer.text(50, 0, this.path);

			let y = 30;
			for (const i in this.listing) {
				try {
					const obj = this.listing[i];

					this.renderer.icon(20, y, await obj.icon);

					let name;
					try {
						name = obj.name.padEnd(25, " ");
					} catch (e) {
						console.log(obj);
						console.warn(e);
					}

					const text = this.selector == i ? "> " + name : "  " + name;

					this.renderer.button(
						50,
						y,
						text,
						async () => {
							// right click
							await this.cd(obj.path);
						},
						async () => {
							// left click
						}
					);
				} catch (e) {
					console.warn(e);
				}

				y += 25;
			}

			this.renderer.commit();
		} catch (e) {
			this.renderer.clear();
			this.renderer.text(0, 0, e);
			this.renderer.commit();
		}
	}
}
