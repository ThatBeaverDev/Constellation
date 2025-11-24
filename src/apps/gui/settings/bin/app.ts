import PanelKit from "panelkit";
import { SettingsPages } from "../components/pages.js";

export default class systemSettings extends GuiApplication {
	page: keyof SettingsPages = "Home";
	pages!: SettingsPages;
	panelkit: PanelKit = new PanelKit(this.renderer);

	async init() {
		this.panelkit.sidebarWidth = 110;

		// pages
		this.pages = new SettingsPages(
			this,
			(page: keyof SettingsPages) => (this.page = page)
		);

		this.renderer.windowName = "System Settings";
		this.renderer.setIcon("cog");
	}

	async frame() {
		this.renderer.clear();

		// sidebar
		this.panelkit.sidebar(
			{ type: "title", text: "Settings" },
			{
				type: "item",
				text: "Home",
				icon: "house",
				callback: () => {
					this.page = "Home";
				}
			},

			{ type: "title", text: "Networking" },
			{
				type: "item",
				text: "Updates",
				icon: "cloud-download",
				callback: () => {
					this.page = "Updates";
				}
			},
			{
				type: "item",
				text: "Network",
				icon: "globe",
				callback: () => {
					this.page = "Network";
				}
			},
			{
				type: "item",
				text: "Cloud",
				icon: "cloud",
				callback: () => {
					this.page = "Cloud";
				}
			},

			//{ type: "title", text: "Graphical Shell" },
			//{
			//	type: "item",
			//	text: "Dock",
			//	icon: "dock",
			//	callback: () => {
			//		this.page = "Dock";
			//	}
			//},
			//{
			//	type: "item",
			//	text: "Menubar",
			//	icon: "panels-top-left",
			//	callback: () => {
			//		this.page = "Menubar";
			//	}
			//},

			{ type: "title", text: "System" },
			{
				type: "item",
				text: "Users",
				icon: "users",
				callback: () => {
					this.page = "Users";
				}
			}
		);

		// body
		await this.pages[this.page].bind(this.pages)();

		this.renderer.commit();
	}
}
