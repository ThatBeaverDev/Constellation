import { SettingsBody } from "../components/body.js";
import { SettingsPages } from "../components/pages.js";
import { SettingsSidebar } from "../components/sidebar.js";

export default class systemSettings extends GuiApplication {
	sidebar?: SettingsSidebar;

	body?: SettingsBody;
	page: keyof SettingsPages = "Home";

	async init() {
		// body
		this.body = new SettingsBody(this);

		// sidebar
		this.sidebar = new SettingsSidebar(this, this.body, 150);

		this.renderer.windowName = "System Settings";
		this.renderer.setIcon("cog");
	}

	async frame() {
		this.renderer.clear();

		if (this.sidebar !== undefined) this.sidebar.render();
		if (this.body !== undefined) await this.body.render();

		this.renderer.commit();
	}
}
