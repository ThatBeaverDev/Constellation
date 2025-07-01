const windows = await env.include("/System/windows.js");

export default class initialiser extends BackgroundProcess {
	async init() {
		const onstart = ["/System/CoreExecutables/com.constellation.terminal" /* DO NOT COMMIT! */];

		for (const app of onstart) {
			env.exec(app);
		}

		this.registerKeyboardShortcut("Launcher", "KeyZ", ["AltLeft"]);
		this.registerKeyboardShortcut("Remap Shortcuts", "KeyX", ["AltLeft"]);
		// windows
		this.registerKeyboardShortcut("Focus Left (Tiling)", "ArrowLeft", ["AltLeft"]);
		this.registerKeyboardShortcut("Focus Right (Tiling)", "ArrowRight", ["AltLeft"]);
		this.registerKeyboardShortcut("Close Window", "KeyW", ["AltLeft"]);
		this.registerKeyboardShortcut("Toggle Window Tiling", "KeyT", ["AltLeft", "ShiftLeft"]);
	}

	onmessage(origin, intent) {
		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-Launcher":
						this.search();
						break;
					case "keyboardShortcutTrigger-Remap Shortcuts":
						env.exec("/System/CoreExecutables/com.constellation.remapper");
						break;
					// windows shortcuts
					case "keyboardShortcutTrigger-Focus Left (Tiling)":
						if (!windows.windowTiling) break;
						// Left!
						windows.focusWindow(windows.focus - 1);
						break;
					case "keyboardShortcutTrigger-Focus Right (Tiling)":
						if (!windows.windowTiling) break;
						// Right!
						windows.focusWindow(windows.focus + 1);
						break;
					case "keyboardShortcutTrigger-Close Window":
						// Close Window!

						if (windows.windows.length == 1) {
							return; // can't close the last window, sorry
						}
						const win = windows.windows[windows.focus];

						win.remove();

						setTimeout(() => {
							const last = windows.windows.length - 1;
							windows.focusWindow(Math.max(0, Math.min(windows.focus, last)));
						}, 160); // wait for animation + layoutTiling
						break;
					case "keyboardShortcutTrigger-Toggle Window Tiling":
						// Toggle tiling
						const tiling = windows.windowTiling;

						windows.setWindowTilingMode(!tiling);
						break;

					default:
						throw new Error("Unknown keyboard shortcut name (intent): " + intent);
				}
				break;
			default:
				console.warn("Unknown message sender: " + origin);
		}
	}

	async search() {
		const checkDir = async (directory, name) => {
			const list = (await env.fs.listDirectory(directory)).data;

			if (list.includes(name)) {
				return env.fs.relative(directory, name);
			}

			for (const item of list) {
				if (item.endsWith("." + name)) {
					return env.fs.relative(directory, item);
				}
			}
		};

		const choice = prompt("Enter the application name:");

		const sys = await checkDir("/System/CoreExecutables", choice);

		if (sys !== undefined) {
			env.exec(sys);
			return;
		}

		alert("App " + choice + " was not found.");

		//const user = await checkDir("~/Applications", choice)
		//
		//if (sys !== undefined) {
		//	env.exec(sys)
		//}
	}
}
