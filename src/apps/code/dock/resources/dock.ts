import { Renderer } from "../../../../lib/uiKit/uiKit";
import { windowAlias } from "../../../../security/env";
import dockAndDesktop from "../tcpsys/app";

export default class dock {
	parent: dockAndDesktop;
	renderer: Renderer;
	winAPI: any;

	dockHeight: number = 50;
	dockPadding: number = 10;
	contextMenu: {
		left: number;
		top: number;
		visible: boolean;
		win?: windowAlias;
	} = {
		visible: false,
		win: undefined,
		top: 0,
		left: 0
	};

	wins: windowAlias[] = [];

	constructor(parent: any) {
		this.parent = parent;
		this.renderer = parent.renderer;

		this.winAPI = this.parent.env.include("/System/windows.js");

		this.init();
	}

	async init() {
		console.debug(await this.parent.env.requestUserPermission("windows"));

		this.refresh();

		this.ok = true;
	}

	ok: boolean = false;

	renderContextMenu() {}

	refresh() {
		this.wins = this.parent.env.allWindows();
	}

	async render() {
		if (this.ok !== true) return;
		if (this.winAPI instanceof Promise) this.winAPI = await this.winAPI;

		this.refresh();

		this.renderer.box(
			125,
			this.renderer.window.dimensions.height - this.dockHeight,
			this.renderer.window.dimensions.width - 250,
			this.dockHeight,
			{
				colour: "var(--main-theme-secondary)",
				borderRadius: "10"
			}
		);

		const wins = this.wins;

		let x = 125 + this.dockPadding;
		let y =
			this.renderer.window.dimensions.height -
			this.dockHeight +
			this.dockPadding;

		const iconWidth = this.dockHeight - this.dockPadding * 2;
		const iconScale = iconWidth / 24;

		for (const win of wins) {
			//if (win.name == "/System/CoreExecutables/Dock.appl") continue; // don't show an icon for the dock

			const iconID = this.renderer.icon(x, y, win.iconName, iconScale);

			this.renderer.onClick(
				iconID,
				() => {
					if (win == undefined) return;
					win.unminimise();
					this.winAPI.focusWindow(win.winID);
				},
				(left: number, top: number) => {
					// show context menu
					this.contextMenu.visible = true;
					this.contextMenu.left = left;
					this.contextMenu.top = top;
					this.contextMenu.win = win;
				}
			);

			x += iconWidth + this.dockPadding;
		}

		if (this.contextMenu.visible) {
			this.renderContextMenu();
		}
	}
}
