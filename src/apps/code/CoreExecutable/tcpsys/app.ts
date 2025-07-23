import { IPCMessage } from "../../../messages";

export default class initialiser extends BackgroundProcess {
	windows?: typeof import("../../../../windows/windows");
	async init() {
		const onstart = ["/System/CoreExecutables/Dock.appl"];

		this.env.setDirectoryPermission(
			"/System/CoreExecutables/Dock.appl",
			"windows",
			true
		);

		for (const app of onstart) {
			this.env.exec(app);
		}

		// TODO: remove once applications menu is done
		setTimeout(() => this.env.exec("/Applications/Finder.appl"), 50);

		this.windows = await this.env.include("/System/windows.js");

		this.registerKeyboardShortcut("Launcher", "KeyZ", ["AltLeft"]);
		this.registerKeyboardShortcut("Remap Shortcuts", "KeyX", ["AltLeft"]);
		// this.windows
		this.registerKeyboardShortcut("Close Window", "KeyW", ["AltLeft"]);
	}

	onmessage(msg: IPCMessage) {
		const intent = msg.intent;
		const origin = msg.originDirectory;

		if (this.windows == undefined) return;

		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-Launcher":
						this.search();
						break;
					case "keyboardShortcutTrigger-Remap Shortcuts":
						this.env.exec(
							"/System/CoreExecutables/com.constellation.remapper"
						);
						break;
					// windows shortcuts
					case "keyboardShortcutTrigger-Close Window": {
						// Close Window!

						const win = this.windows.getWindowOfId(
							this.windows.focus
						);

						if (win == undefined) return;

						win.remove();

						setTimeout(() => {
							if (this.windows == undefined) return;

							const last = this.windows.windows.length - 1;
							this.windows.focusWindow(
								Math.max(0, Math.min(this.windows.focus, last))
							);
						}, 160); // wait for animation + layoutTiling
						break;
					}

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

	async search() {
		await this.env.exec("/Applications/Search.appl");
	}
}
