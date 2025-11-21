import systemSettings from "../bin/app.js";
import { SettingsBody } from "./body.js";
import { SettingsPages } from "./pages.js";

export class SettingsSidebar {
	renderer: systemSettings["renderer"];
	sidebarWidth: number;

	constructor(
		public parent: systemSettings,
		public body: SettingsBody,
		width: number = 100
	) {
		this.renderer = parent.renderer;
		this.sidebarWidth = width;
	}

	render() {
		this.renderer.box(
			0,
			0,
			this.sidebarWidth,
			this.renderer.windowHeight + 100,
			{
				background: "sidebar"
			}
		);

		//this.renderer.textbox(0, 0, this.sidebarWidth, 25, "Search Settings", {
		//	enter: () => {
		//		this.renderer.prompt("Search not implemented.");
		//	}
		//});

		let y = 27;
		const item = (text: keyof SettingsPages, icon: string) => {
			this.renderer
				.box(0, y, this.sidebarWidth, 25, {
					background: "sidebar"
				})
				.onClick(() => {
					this.parent.page = text;
				});

			this.renderer.icon(4, y, icon).passthrough();
			this.renderer.text(32, y + 3, text).passthrough();

			y += 30;
		};
		const title = (title: string) => {
			this.renderer.text(4, y, title, 10, "var(--text-muted)");

			y += 20;
		};

		// primary
		title("Settings");
		item("Home", "house");

		// networking
		title("Networking");
		item("Updates", "cloud-download");
		item("Network", "globe");
		item("Cloud", "cloud");

		// system components
		//title("Graphical Shell");
		//item("Dock", "dock");
		//item("Menubar", "panels-top-left");

		// system
		title("System Management");
		item("Users", "users");
	}
}
