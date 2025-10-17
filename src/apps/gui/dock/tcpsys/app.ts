import Dock, { dockConfig } from "../components/dock.js";
import menubar, { menubarConfig } from "../components/menubar.js";

interface config {
	dock: dockConfig;
	menubar: menubarConfig;
	name: string;
	icon: string;
}

export default class dockAndDesktop extends Overlay {
	dock?: Dock;
	menubar?: menubar;
	showApps: boolean = false;
	config: config = {
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

		this.dock = new Dock(this);
		this.menubar = new menubar(this);

		this.renderer.minimiseWindow = () => {
			this.showApps = true;
		};
	}

	async loadConfig() {
		const dir = this.env.fs.resolve(this.directory, "./data");
		const list = await this.env.fs.listDirectory(dir);
		if (!list.ok) throw list.data;
		let configs = list.data;

		if (configs == undefined) {
			// the directory doesn't exist.
			const mkdir = await this.env.fs.createDirectory(dir);

			if (!mkdir.ok) throw mkdir.data;

			const list = await this.env.fs.listDirectory(dir);
			if (!list.ok) throw list.data;
			configs = list.data;
		}

		if (configs.includes(this.env.userID + ".json")) {
			// we have the config, let's load it.
			const read = await this.env.fs.readFile(
				this.env.fs.resolve(
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

		const configDirectory = this.env.fs.resolve(
			this.directory,
			"./data/" + this.env.userID + ".json"
		);
		await this.env.fs.writeFile(configDirectory, configString);
	}

	frame() {
		// resize and reposition
		this.renderer.moveWindow(0, 0);
		this.renderer.resizeWindow(
			this.renderer.displayWidth,
			this.renderer.displayHeight
		);

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
			if (this.dock == undefined) return;

			switch (code) {
				case "escape":
					this.dock.endFocus();
					this.dockFocus = false;
					break;
				default:
					if (this.dock == undefined) return;
					this.dock.updateFocus(code);
			}
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

					focusedWindow.fullscreen();
					break;
				case "KeyD":
					if (this.dock == undefined) return;

					this.dockFocus = true;
					this.dock.triggerFocus();
					this.env.log("focus");
					break;
				case "ArrowLeft":
			}
		}
	}

	async search() {
		await this.env.exec("/Applications/Search.appl");
	}

	async terminate() {
		this.dock?.terminate();
		this.menubar?.terminate();
	}
}
