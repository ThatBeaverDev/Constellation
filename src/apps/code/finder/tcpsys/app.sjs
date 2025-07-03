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

		const [
			initialDirectory = "/",
			mode = "app",
			recievingPipe,
			sendingPipe
		] = this.args;

		await this.cd(initialDirectory);
		this.type = mode;
		this.pipes = {
			recieve: recievingPipe,
			send: sendingPipe
		};

		this.renderer.setWindowIcon("folder");

		this.registerKeyboardShortcut("Scroll Down", "ArrowDown", []);
		this.registerKeyboardShortcut("Scroll Down (Fast)", "ArrowDown", [
			"ShiftLeft"
		]);
		this.registerKeyboardShortcut("Scroll Up", "ArrowUp", []);
		this.registerKeyboardShortcut("Scroll Up (Fast)", "ArrowUp", [
			"ShiftLeft"
		]);
		this.registerKeyboardShortcut("Descend Directory", "Enter", []);
		this.registerKeyboardShortcut("Ascend Directory", "Escape", []);
		this.registerKeyboardShortcut("Select Directory", "KeyG", ["AltLeft"]);

		setInterval(() => {
			this.cd(this.path);
		}, 500);
	}

	onmessage(origin, intent) {
		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-Scroll Down":
						this.selector = clamp(
							this.selector + 1,
							0,
							this.listing.length - 1
						);
						break;
					case "keyboardShortcutTrigger-Scroll Down (Fast)":
						this.selector = clamp(
							this.selector + 2,
							0,
							this.listing.length - 1
						);
						break;
					case "keyboardShortcutTrigger-Scroll Up":
						this.selector = clamp(
							this.selector - 1,
							0,
							this.listing.length - 1
						);
						break;
					case "keyboardShortcutTrigger-Scroll Up (Fast)":
						this.selector = clamp(
							this.selector - 2,
							0,
							this.listing.length - 1
						);
						break;
					case "keyboardShortcutTrigger-Descend Directory": {
						const obj = this.listing[this.selector];
						this.cd(obj.path);
						this.selector = undefined;
						break;
					}
					case "keyboardShortcutTrigger-Ascend Directory":
						this.selector = 0;
						this.cd("..");
						break;
					case "keyboardShortcutTrigger-Select Directory":
						// TODO: GRAPHICAL PROMPT
						// eslint-disable-next-line
						this.cd(prompt("Select a directory"));
						break;
					default:
						throw new Error(
							"Unknown keyboard shortcut name (intent): " + intent
						);
				}
				break;
			default:
				console.warn("Unknown message sender: " + origin);
		}
	}

	async cd(directory) {
		const oldDir = String(this.path);

		if (oldDir !== directory) {
			this.selector = 0;
		}

		this.path = env.fs.relative(this.path, directory);
		const dir = this.path;
		if (this.path == "/") {
			this.location = "Constellation";
		} else {
			this.location =
				"Constellation" + String(this.path).replaceAll("/", " > ");
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

		this.listing = await this.listing.map((name) => {
			const obj = {};
			obj.name = name;
			obj.path = env.fs.relative(this.path, name);
			obj.icon = fsDisplayLib.pathIcon(obj.path);

			return obj;
		});

		for (const obj of this.listing) {
			obj.type = await env.fs.typeOfFile(obj.path);
		}

		const newIcon = await fsDisplayLib.pathIcon(this.path);
		if (newIcon !== this.icon) {
			this.icon = newIcon;
			this.renderer.setWindowIcon(this.icon);
		}
	}

	async frame() {
		// pipe messages (for picker)
		if (this.pipes.recieve !== undefined) {
			for (const i in this.pipes.recieve) {
				const item = this.pipes.recieve[0];
				if (typeof item !== "object") continue;

				this.pipes.recieve.splice(0, 1);
			}
		}

		// if we're a picker, name ourselves so
		if (this.type == "picker") {
			this.renderer.window.rename("File Picker - " + this.path);
		} else {
			this.renderer.window.rename("Finder - " + this.path);
		}

		// insure this.selector is defined
		if (this.selector == undefined) {
			this.selector = 0;
		}

		this.renderer.clear();

		// prevent execution when the listing is blank
		if (this.listing == undefined) {
			return;
		}

		// draw the folder name and icon at the top for the current location
		this.renderer.icon(20, 0, await this.icon);
		this.renderer.text(50, 0, this.path);

		// draw the folder contents
		let y = 30;
		for (const i in this.listing) {
			const obj = this.listing[i];

			this.renderer.icon(20, y, await obj.icon);

			// insure the name is the right length
			const name = String(obj.name).padEnd(25, " ");

			// add a '> ' if the item is selected, else just '  ', so everything is on the same starting point
			const text = this.selector == i ? "> " + name : "  " + name;

			// render
			this.renderer.button(
				50,
				y,
				text,
				async () => {
					// right click
					if (this.selector == i) {
						switch (obj.type) {
							case "directory":
								await this.cd(obj.path);
								break;
							case "file":
								if (this.type == "picker") {
									// select and submit the file
									this.pickerSubmit();
								} else {
									/* TODO: OPEN THE FILE! */
									env.prompt(
										"Functionality not implemented: opening files",
										"no current API for opening files in applications."
									);
								}

								break;
							default:
								throw new Error(
									"Unknown filetype cannot be handled for action: " +
										obj.type
								);
						}
					} else {
						this.selector = i;
					}
				},
				async () => {
					// left click
				}
			);

			y += 25;
		}

		if (this.type == "picker") {
			// get the name
			const itemName = this.listing[this.selector].name;
			// get the path
			const path =
				itemName == ".."
					? this.path
					: env.fs.relative(this.path, itemName);

			this.renderer.button(
				5,
				this.renderer.window.dimensions.height - 50,
				"Select location (" + path + ")",
				this.pickerSubmit
			);
		}

		this.renderer.commit();
	}

	pickerSubmit() {
		const itemName = this.listing[this.selector].name;
		const path =
			itemName == ".." ? this.path : env.fs.relative(this.path, itemName);

		env.debug(
			this.directory,
			"Submitting '" + path + "' for file picker result."
		);

		// send it to the caller and exit
		this.pipes.send.push({ intent: "selectionComplete", data: path });
		this.exit();
	}
}
