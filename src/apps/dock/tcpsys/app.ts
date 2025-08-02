import { IPCMessage } from "../../messages.js";
import dock from "../resources/dock.js";
import menubar from "../resources/menubar.js";

export default class dockAndDesktop extends Application {
	dock?: dock;
	menubar?: menubar;
	showApps: boolean = false;

	async init() {
		this.renderer.makeWindowInvisible();
		this.renderer.hideWindowHeader();
		this.renderer.hideWindowCorners();

		//this.renderer.setIcon("dock")
		this.renderer.setIcon(
			"/System/CoreAssets/Logos/Constellation-White.svg"
		);
		this.renderer.windowName = "Constellation";

		this.registerKeyboardShortcut("Search", "KeyZ", ["AltLeft"]);
		this.registerKeyboardShortcut("Library", "KeyX", ["AltLeft"]);

		this.dock = new dock(this);
		this.menubar = new menubar(this);

		this.renderer.minimiseWindow = () => {
			this.showApps = true;
		};
	}

	frame() {
		// resize and reposition
		this.renderer.moveWindow(0, 0);
		this.renderer.resizeWindow(window.innerWidth, window.innerHeight);

		this.renderer.clear();

		if (this.dock !== undefined) this.dock.render();
		if (this.menubar !== undefined) this.menubar.render();

		this.renderer.commit();
	}

	onmessage(msg: IPCMessage) {
		const intent = msg.intent;
		const origin = msg.originDirectory;

		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-Search":
						this.search();
						break;
					case "keyboardShortcutTrigger-Library":
						this.env.exec("/System/CoreExecutables/Library.appl");
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
		await this.env.exec("/Applications/Search.appl");
	}
}
