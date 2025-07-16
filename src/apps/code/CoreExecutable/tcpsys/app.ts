import { IPCMessage } from "../../../messages";

export default class initialiser extends BackgroundProcess {
	windows?: typeof import("../../../../windows/windows");
	async init() {
		const onstart = [
			"/System/CoreExecutables/Dock.appl",
			"/Applications/Finder.appl"
		];

		for (const app of onstart) {
			this.env.exec(app);
		}

		this.windows = await this.env.include("/System/windows.js");

		this.registerKeyboardShortcut("Launcher", "KeyZ", ["AltLeft"]);
		this.registerKeyboardShortcut("Remap Shortcuts", "KeyX", ["AltLeft"]);
		// this.windows
		this.registerKeyboardShortcut("Focus Left (Tiling)", "ArrowLeft", [
			"AltLeft"
		]);
		this.registerKeyboardShortcut("Focus Right (Tiling)", "ArrowRight", [
			"AltLeft"
		]);
		this.registerKeyboardShortcut("Close Window", "KeyW", ["AltLeft"]);
		this.registerKeyboardShortcut("Toggle Window Tiling", "KeyT", [
			"AltLeft",
			"ShiftLeft"
		]);
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
					case "keyboardShortcutTrigger-Focus Left (Tiling)":
						if (!this.windows.windowTiling) break;
						// Left!
						this.windows.focusWindow(this.windows.focus - 1);
						break;
					case "keyboardShortcutTrigger-Focus Right (Tiling)":
						if (!this.windows.windowTiling) break;
						// Right!
						this.windows.focusWindow(this.windows.focus + 1);
						break;
					case "keyboardShortcutTrigger-Close Window": {
						// Close Window!

						if (this.windows.windows.length == 1) {
							return; // can't close the last window, sorry
						}
						const win = this.windows.windows[this.windows.focus];

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
					case "keyboardShortcutTrigger-Toggle Window Tiling": {
						// Toggle tiling
						const tiling = this.windows.windowTiling;

						this.env.debug("Toggling tiling");

						this.windows.setWindowTilingMode(!tiling);
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
