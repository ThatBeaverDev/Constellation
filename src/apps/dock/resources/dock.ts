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
	width: number = 0;

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

	calculateDockWidth(scale: number = 1) {
		const iconWidth = this.dockHeight - this.dockPadding * 2;
		const iconGap = iconWidth + this.dockPadding;

		return iconGap * this.wins.length + this.dockPadding;
	}

	async render() {
		if (this.ok !== true) return;
		if (this.winAPI == undefined) return;

		this.refresh();

		const wins = this.wins;

		const iconWidth = this.dockHeight - this.dockPadding * 2;
		const iconScale = iconWidth / 24;

		const iconGap = iconWidth + this.dockPadding;
		const targetWidth = this.calculateDockWidth();
		this.width = Math.round(this.width + (targetWidth - this.width) / 5);

		let scale = 1;
		if (this.width > this.renderer.windowWidth) {
			scale = this.renderer.windowWidth / this.width;
		}

		const dockLeft = (this.renderer.windowWidth - this.width * scale) / 2;

		const dockPadding = this.dockPadding * scale;

		let x = dockLeft + this.dockPadding * scale;
		let y =
			this.renderer.windowHeight - this.dockHeight * scale + dockPadding;

		this.renderer.box(
			dockLeft,
			this.renderer.windowHeight - this.dockHeight * scale,
			this.width * scale,
			this.dockHeight * scale,
			{
				background: "var(--main-theme-secondary)",
				borderRadius: "10"
			}
		);

		for (const win of wins) {
			const iconID = this.renderer.icon(
				x,
				y,
				win.iconName,
				iconScale * scale
			);

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

			x += iconGap * scale;
		}
	}
}
