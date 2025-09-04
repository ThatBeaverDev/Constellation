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
			pins: [
				"/Applications/Finder.appl",
				"/Applications/Settings.appl",
				"/Applications/Search.appl"
			]
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

		// ask to listen to every key pressed if we're not allowed :>
		let getPerms: boolean | undefined = false;
		try {
			getPerms = await this.env.requestUserPermission("keylogger");
		} catch {}
		if (getPerms !== true) {
			this.exit();
			return;
		}

		this.registerKeyboardShortcut("Search", "KeyZ", ["AltLeft"]);
		this.registerKeyboardShortcut("Library", "KeyX", ["AltLeft"]);

		this.registerKeyboardShortcut("Lock", "KeyQ", ["AltLeft"]);

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
				env.fs.resolve(
					this.directory,
					"./data/" + this.env.userID + ".json"
				)
			);
			if (!read.ok) throw read.data;
			const config = JSON.parse(read.data || "{}");

			this.config = config;
		} else {
			// no config, just leave the default in place.
		}
	}

	async commitConfig() {
		const configString = JSON.stringify(this.config);

		const configDirectory = env.fs.resolve(
			this.directory,
			"./data/" + this.env.userID + ".json"
		);
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

	dockFocus: boolean = false;

	keydown(
		code: string,
		metaKey: boolean,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		repeat: boolean
	): void | undefined | null {
		// dock focus code
		if (this.dockFocus && code !== "KeyD") {
			this.dockFocus = false;
		}

		if (altKey) {
			switch (code) {
				case "KeyZ":
					this.search();
					break;
				case "KeyX":
					this.env.exec("/System/CoreExecutables/Library.appl");
					break;
				case "KeyL":
					this.exit();
					break;
				case "Enter":
					if (this == undefined) return;
					const focusedWindow = this.env.windows.getFocus();

					if (focusedWindow == undefined) return;
					if (this.menubar == undefined) return;
					if (this.dock == undefined) return;

					focusedWindow.resize(
						window.innerWidth,
						window.innerHeight -
							this.menubar.barHeight -
							this.dock.dockHeight
					);
					focusedWindow.move(0, this.menubar.barHeight);
					break;
				case "KeyD":
					if (altKey) {
						this.dockFocus = true;
						console.log("focus");
					}
					break;
			}
		}
	}

	async search() {
		await this.env.exec("/Applications/Search.appl");
	}
}
