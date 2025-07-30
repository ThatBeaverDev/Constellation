import { Renderer } from "../../../lib/uiKit/uiKit";
import { ApplicationAuthorisationAPI } from "../../../security/env";
import { WindowAlias } from "../../../security/definitions";
import dockAndDesktop from "../tcpsys/app";

export default class dock {
	parent: dockAndDesktop;
	renderer: Renderer;
	env: ApplicationAuthorisationAPI;
	winAPI?: typeof import("../../../windows/windows");

	dockHeight: number = 50;
	dockPadding: number = 10;
	wins: WindowAlias[] = [];
	ok: boolean = false;

	constructor(parent: dockAndDesktop) {
		this.parent = parent;
		this.renderer = parent.renderer;
		this.env = parent.env;

		this.init();
	}

	async init() {
		let getPerms: boolean | undefined = false;
		try {
			getPerms = await this.parent.env.requestUserPermission("windows");
		} catch {}

		if (getPerms !== true) return;

		this.winAPI = await this.parent.env.include("/System/windows.js");

		this.refresh();

		this.ok = true;
	}

	refresh() {
		this.wins = this.parent.env.windows.all();
	}

	async render() {
		if (this.ok !== true) return;
		if (this.winAPI == undefined) return;

		this.refresh();

		this.renderer.box(
			125,
			this.renderer.windowHeight - this.dockHeight,
			this.renderer.windowWidth - 250,
			this.dockHeight,
			{
				background: "var(--main-theme-secondary)",
				borderRadius: "10"
			}
		);

		const wins = this.wins;

		let x = 125 + this.dockPadding;
		let y = this.renderer.windowHeight - this.dockHeight + this.dockPadding;

		const iconWidth = this.dockHeight - this.dockPadding * 2;
		const iconScale = iconWidth / 24;

		for (const win of wins) {
			const iconID = this.renderer.icon(x, y, win.iconName, iconScale);

			this.renderer.onClick(
				iconID,
				() => {
					if (this.winAPI == undefined) return;
					if (win == undefined) return;

					if (win.minimised) {
						win.unminimise();
					} else {
						win.minimise();
					}

					this.winAPI.focusWindow(win.winID);
				},
				(left: number, top: number) => {
					// menu items
					const contextMenuItems = {
						"Show in Finder": () =>
							this.env.exec("/Applications/Finder.appl", [
								env.fs.resolve(win.applicationDirectory, "..")
							]),
						Minimise: () => win.minimise(),
						Restore: () => win.unminimise(),
						Close: () => win.close()
					};

					// show menu
					this.renderer.setContextMenu(
						left,
						top,
						win.name,
						contextMenuItems
					);

					// remove menu on click
					//this.renderer.awaitClick(() => {
					//	this.renderer.removeContextMenu();
					//});
				}
			);

			x += iconWidth + this.dockPadding;
		}
	}
}
