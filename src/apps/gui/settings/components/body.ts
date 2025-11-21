import systemSettings from "../bin/app.js";
import { SettingsPages } from "./pages.js";

export class SettingsBody {
	pages: SettingsPages;

	constructor(public parent: systemSettings) {
		this.pages = new SettingsPages(
			this.parent.renderer,
			this.parent.env,
			this.parent.sidebar?.sidebarWidth || 150,
			(page: keyof SettingsPages) => {
				parent.page = page;
			}
		);
	}

	async render() {
		await this.pages[this.parent.page].bind(this.pages)();
	}
}
