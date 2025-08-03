import { IPCMessage } from "../../../runtime/messages.js";
import dock, { dockConfig } from "../resources/dock.js";
import menubar from "../resources/menubar.js";

interface menubarConfig {}

export default class dockAndDesktop extends Application {
	dock?: dock;
	menubar?: menubar;
	showApps: boolean = false;
	config: {
		dock: dockConfig;
		menubar: menubarConfig;
		name: string;
		icon: string;
	} = {
		dock: {
			pins: ["/Applications/Finder.appl", "/Applications/Settings.appl", "/Applications/Search.appl"]
		},
		menubar: {},
		name: "Constellation",
		icon: "/System/CoreAssets/Logos/Constellation-lucide.svg"
	};
	oldConfig: string = "";
	tick: number = 0;

	async init() {
		this.renderer.makeWindowInvisible();
		this.renderer.hideWindowHeader();
		this.renderer.hideWindowCorners();

		//this.renderer.setIcon("dock")
		this.renderer.setIcon(this.config.icon);
		this.renderer.windowName = this.config.name;

		this.registerKeyboardShortcut("Search", "KeyZ", ["AltLeft"]);
		this.registerKeyboardShortcut("Library", "KeyX", ["AltLeft"]);

		await this.loadConfig();

		this.dock = new dock(this);
		this.menubar = new menubar(this);

		this.renderer.minimiseWindow = () => {
			this.showApps = true;
		};
	}

	async loadConfig() {
		const dir = env.fs.resolve(this.directory, "./data");
		const list = await this.env.fs.listDirectory(dir);
		if (!list.ok) throw list.data;
		let configs = list.data;

		if (configs == undefined) {
			// the directory doesn't exist.
			const mkdir = await env.fs.createDirectory(dir);

			if (!mkdir.ok) throw mkdir.data;

			const list = await this.env.fs.listDirectory(dir);
			if (!list.ok) throw list.data;
			configs = list.data;
		}

		if (configs.includes(this.env.userID + ".json")) {
			// we have the config, let's load it.
			const read = await this.env.fs.readFile(
				env.fs.resolve(this.directory, "./data/" + this.env.userID + ".json")
			);
			if (!read.ok) throw read.data;
			const config = JSON.parse(read.data);

			this.config = config;
		} else {
			// no config, just leave the default in place.
		}
	}

	async commitConfig() {
		const configString = JSON.stringify(this.config);

		const configDirectory = env.fs.resolve(this.directory, "./data/" + this.env.userID + ".json");
		await env.fs.writeFile(configDirectory, configString);
	}

	frame() {
		// resize and reposition
		this.renderer.moveWindow(0, 0);
		this.renderer.resizeWindow(window.innerWidth, window.innerHeight);

		// save config if it's changed.
		if (this.oldConfig !== JSON.stringify(this.config)) {
			this.oldConfig = JSON.stringify(this.config);
			this.commitConfig();
		}

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
