import { onClickOptions } from "../../../../gui/uiKit/definitions.js";
import finder, { listing } from "../tcpsys/app.js";
import finderInteractions from "./interactions.js";

export default class finderBody {
	renderer: finder["renderer"];
	env: finder["env"];
	parent: finder;

	// submodule
	interactions: finderInteractions;

	// rendering settings
	/**
	 * Padding from the sidebar to the content
	 */
	contentPadding: number = 10;
	/**
	 * Padding within a displayItem
	 */
	displayItemPadding: number = 5;
	/**
	 * the Scale of the icons
	 */
	iconScale: number = 0.5;

	constructor(parent: finder) {
		this.parent = parent;
		this.env = parent.env;
		this.renderer = parent.renderer;

		this.interactions = new finderInteractions(parent);
	}

	displayItem(
		x: number = 100 + this.contentPadding,
		y: number = this.contentPadding,
		icon: string = "/System/CoreAssets/Vectors/files/file.svg",
		name: string = "File",
		subtext: string = "Unknown",
		selected: boolean = false,
		leftClick: Function = () => {},
		rightClick: Function = () => {}
	) {
		const iconScale = 1.4166666666;
		//const width = 39 + Math.max( this.renderer.getTextWidth(name), this.renderer.getTextWidth(subtext) ) + padding * 2;
		const width =
			this.renderer.windowWidth -
			this.parent.sidebarWidth -
			this.contentPadding * 2;
		const height = 34 + this.displayItemPadding * 2;

		if (selected == true) {
			this.renderer.box(x, y, width, height, {
				background: "var(--main-accent-tertiary)",
				borderRadius: 4
			});
		}

		const iconElem = this.renderer.icon(
			x + this.displayItemPadding,
			y + this.displayItemPadding,
			icon,
			iconScale
		);

		const titleElem = this.renderer.text(
			x + 39 + this.displayItemPadding,
			y + 3 + this.displayItemPadding,
			name
		);
		const subtextElem = this.renderer.text(
			x + 39 + this.displayItemPadding,
			y + 20 + this.displayItemPadding,
			subtext,
			10
		);

		const onClickConfig: onClickOptions = {
			scale: 1.1,
			origin: "left"
		};

		this.renderer.onClick(iconElem, leftClick, rightClick, onClickConfig);
		this.renderer.onClick(titleElem, leftClick, rightClick, onClickConfig);
		this.renderer.onClick(
			subtextElem,
			leftClick,
			rightClick,
			onClickConfig
		);

		return { width, height };
	}

	render() {
		if (this.parent.location == undefined) return;

		const iconScale = 0.5;

		this.renderer.box(0, 0, 100, this.renderer.windowHeight + 100, {
			background: "sidebar"
		});

		const contentArea = this.renderer.box(
			0,
			0,
			this.renderer.windowWidth,
			this.renderer.windowHeight,
			{ background: "transparent" }
		);

		this.renderer.onClick(
			contentArea,
			undefined,
			this.interactions.showBodyContextMenu()
		);

		// draw the folder name and icon at the top for the current location
		this.renderer.text(10, 10, "Important", 10);
		const usrinf = this.env.users.userInfo();
		if (usrinf == undefined) return;

		const homedir = usrinf.directory;
		const important: Record<string, string> = {
			Documents: this.env.fs.resolve(homedir, "./Documents"),
			Desktop: this.env.fs.resolve(homedir, "./Desktop"),
			Notes: this.env.fs.resolve(homedir, "./Notes"),
			Home: homedir
		};
		let y = 10 + 10 * 1.2;
		for (const name in important) {
			const icon = this.renderer.icon(10, y, "folder", iconScale);
			const text = this.renderer.text(25, y, name, 12);

			const onclick = () => {
				this.parent.cd(important[name]);
			};

			this.renderer.onClick(icon, onclick);
			this.renderer.onClick(text, onclick);

			y += 10 + 12 * 1.2;
		}

		const dims = this.displayItem(
			undefined,
			undefined,
			this.parent.location.icon,
			this.parent.location.path + " - Current Location",
			this.parent.location.subtext
		);

		const baseY = dims.height + 20 + this.contentPadding;

		// draw the folder contents
		let x = this.parent.sidebarWidth + this.contentPadding;
		y = baseY;

		if (this.parent.textDisplay !== undefined) {
			const fakeListing: listing = {
				name: "..",
				path: this.parent.path.textBeforeLast("/"),
				icon: "/System/CoreAssets/Vectors/files/folder.svg",
				type: "directory",
				subtext: "Exit this folder"
			};

			this.displayItem(
				x,
				y,
				"/System/CoreAssets/Vectors/files/folder.svg",
				"..",
				"Exit this folder",
				this.parent.selector == 0,
				this.interactions.displayItemLeftClick(fakeListing, "0")
			);

			const text = this.parent.textDisplay;
			const textWidth = this.renderer.getTextWidth(text);
			const textHeight = 15 * 1.2;

			const leftPadding =
				this.parent.sidebarWidth +
				this.contentPadding +
				this.contentPadding;
			const topPadding =
				dims.height + this.contentPadding + this.contentPadding;

			const areaWidth = this.renderer.windowWidth - leftPadding;
			const areaHeight = this.renderer.windowHeight - topPadding;

			const left = leftPadding + (areaWidth - textWidth) / 2;
			const top = topPadding + (areaHeight - textHeight) / 2;

			this.renderer.text(left, top, this.parent.textDisplay);

			return;
		}

		for (const index in this.parent.listing) {
			const obj: listing = this.parent.listing[index];

			this.displayItem(
				x,
				y,
				obj.icon,
				obj.name,
				obj.subtext,
				this.parent.selector == Number(index),
				this.interactions.displayItemLeftClick(obj, index),
				this.interactions.displayItemRightClick(obj)
			);

			// move down
			y += 45;
		}

		if (this.parent.type == "picker") {
			// get the name
			const itemName = this.parent.listing[this.parent.selector].name;
			// get the path
			const path =
				itemName == ".."
					? this.parent.path
					: this.env.fs.resolve(this.parent.path, itemName);

			this.renderer.button(
				5,
				this.renderer.windowHeight - 50,
				"Select location (" + path + ")",
				this.parent.pickerSubmit
			);
		}
	}
}
