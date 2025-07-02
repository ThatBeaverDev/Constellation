// convert anything to a string, NICELY (no [object Object] here)
function stringify(content) {
	const type = typeof content;

	switch (type) {
		case "object":
		case "Object":
			if (content instanceof HTMLElement) {
				return content.outerHTML;
			}

			return JSON.stringify(content);
		default:
			return String(content);
	}
}

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

export default class terminalUI extends Application {
	async init() {
		this.ok = false;

		const cmdregDir = env.fs.relative(this.directory, "./lib/cmdreg.sjs");
		this.cmdreg = await env.include(cmdregDir);

		this.renderer.window.rename("Terminal");
		this.renderer.setWindowIcon("square-terminal");
		this.logs = [];
		this.terminalPath = "/";

		this.scroll = 0;
		this.displayedLogs = 50;
		this.tick = 50;
		this.tick2 = 0;

		this.registerKeyboardShortcut("Scroll Down", "ArrowDown", []);
		this.registerKeyboardShortcut("Scroll Down (Fast)", "ArrowDown", [
			"ShiftLeft"
		]);
		this.registerKeyboardShortcut("Scroll Up", "ArrowUp", []);
		this.registerKeyboardShortcut("Scroll Up (Fast)", "ArrowUp", [
			"ShiftLeft"
		]);

		this.ok = true;
	}

	getCommand(name) {
		switch (name) {
			case "help":
				return () =>
					`Terminal commands are as follows:\n- ` +
					Object.keys(this.cmdreg).join("\n- ");
			default:
				return this.cmdreg[name];
		}
	}

	onmessage(origin, intent) {
		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-Scroll Down":
						this.scroll = clamp(
							this.scroll - 1,
							0,
							this.logs.length - this.displayedLogs
						);
						break;
					case "keyboardShortcutTrigger-Scroll Down (Fast)":
						this.scroll = clamp(
							this.scroll - 2,
							0,
							this.logs.length - this.displayedLogs
						);
						break;
					case "keyboardShortcutTrigger-Scroll Up":
						this.scroll = clamp(
							this.scroll + 1,
							0,
							this.logs.length - this.displayedLogs
						);
						break;
					case "keyboardShortcutTrigger-Scroll Up (Fast)":
						this.scroll = clamp(
							this.scroll + 2,
							0,
							this.logs.length - this.displayedLogs
						);
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

	keydown(code, cmd, opt, ctrl, shift, isRepeat) {
		let speed = 1;

		if (shift) {
			speed += 5;
		}

		switch (code) {
			case "ArrowUp":
			case "ArrowDown":
			case "ControlLeft":
			case "ControlRight":
			case "ShiftLeft":
			case "ShiftRight":
			case "ControlLeft":
			case "ControlRight":
			case "MetaLeft":
			case "MetaRight":
			case "AltLeft":
			case "AltRight":
				break;
			default:
				// reset the scroll whenever it's not an arrow key
				this.scroll = 0;
		}
	}

	render() {
		this.renderer.clear();

		let y = 15;
		const visibleLogs = this.logs.slice(
			-50 - this.scroll,
			-this.scroll || undefined
		);

		for (const i of visibleLogs) {
			this.renderer.text(0, y, i);
			y += 18;
		}

		y += 5;

		this.renderer.textbox(
			0,
			y,
			"",
			{
				update: () => {},
				enter: async (text) => {
					this.hasExecutedCommand = true;

					const args = text.trim().split(" ");
					const cmd = args.splice(0, 1)[0].trim();

					this.logs.push(text);

					const bin = this.getCommand(cmd);
					if (typeof bin !== "function") {
						this.logs.push(
							cmd + " is not a known or found command."
						);
						return;
					}

					let logs;
					try {
						logs = (await bin(this, ...args)) || "";
					} catch (error) {
						logs =
							"<red>" +
							error.type +
							": " +
							error.message +
							"</red>";
					}
					if (typeof logs !== "string") {
						logs = stringify(logs);
					}

					if ([null, undefined, ""].includes(logs)) {
						return;
					}

					for (const line of logs.split("\n")) {
						this.logs.push(line);
					}

					this.render();
				}
			},
			{
				isInvisible: true,
				isEmpty: this.hasExecutedCommand
			}
		);

		this.renderer.commit();
		this.hasExecutedCommand = false;
	}

	frame() {
		if (!this.ok) {
			return;
		}

		this.render();
	}
}
