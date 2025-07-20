import { Renderer } from "../../../../lib/uiKit/uiKit";
import {
	ApplicationAuthorisationAPI,
	windowAlias
} from "../../../../security/env";
import dockAndDesktop from "../tcpsys/app";

export default class dock {
	parent: dockAndDesktop;
	renderer: Renderer;
	env: ApplicationAuthorisationAPI;
	winAPI: any;

	dockHeight: number = 50;
	dockPadding: number = 10;
	wins: windowAlias[] = [];

	constructor(parent: any) {
		this.parent = parent;
		this.renderer = parent.renderer;
		this.env = parent.env;

		this.winAPI = this.parent.env.include("/System/windows.js");

		this.init();
	}

	async init() {
		let getPerms: boolean | undefined = false;
		try {
			getPerms = await this.parent.env.requestUserPermission("windows");
		} catch {}

		if (getPerms !== true) return;

		this.refresh();

		this.ok = true;
	}

	ok: boolean = false;

	contextMenu: {
		left: number;
		top: number;
		visible: boolean;
		win?: windowAlias;
	} = { visible: false, win: undefined, top: 0, left: 0 };

	renderContextMenu() {
		if (this.contextMenu == undefined) return;

		const c = this.contextMenu;
		const title = String(c.win?.name);

		// get string stuff
		const strings = [title, "Show in Finder...", "Flick", "Close"];
		let longestString = "";
		for (const str of strings) {
			if (str.length > longestString.length) {
				longestString = str;
			}
		}

		const x = c.left;
		let y = c.top - 500;

		const padding = 10;
		const width = this.renderer.getTextWidth(longestString) + padding * 2; //150
		const height = 500;

		this.renderer.box(x, y, width, height, {
			colour: "var(--main-theme-tertiary)",
			borderRadius: 10
		});

		const titleWidth = this.renderer.getTextWidth(title);
		y += padding;
		this.renderer.text(x + padding, y, strings[0]);

		y += padding * 2 + 5;
		this.renderer.button(
			x + padding,
			y,
			strings[1].padEnd(longestString.length, " "),
			() => {
				this.env.exec("/Applications/Finder.appl", [
					env.fs.relative(c.win?.applicationDirectory, "..")
				]);
			}
		);
	}

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

					win.toggleMinification();

					this.winAPI.focusWindow(win.winID);
				},
				(left: number, top: number) => {
					// show context menu
					this.contextMenu.visible = true;
					this.contextMenu.left = left;
					this.contextMenu.top = top;
					this.contextMenu.win = win;

					this.renderer.awaitClick(() => {
						this.env.log(this.parent.directory, "context gone");
						this.contextMenu.visible = false;
					});
				}
			);

			x += iconWidth + this.dockPadding;
		}

		if (this.contextMenu.visible) {
			this.renderContextMenu();
		}
	}
}
