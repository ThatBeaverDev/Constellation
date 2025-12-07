import ConstellationWindowManager from "../bin/app.js";

export class ConstellationWindowManagerWallpaper {
	env: ConstellationWindowManager["env"];
	renderer: ConstellationWindowManager["renderer"];
	defaultWallpaper =
		"/System/CoreAssets/Wallpapers/Bailey Zindel - Yosemite Valley.jpg";
	wallpaperPath: string = this.defaultWallpaper;

	constructor(public parent: ConstellationWindowManager) {
		this.env = parent.env;
		this.renderer = parent.renderer;
	}

	async init() {
		const user = this.env.user;
		const userinf = this.env.users.userInfo(user);
		if (userinf == undefined) return;

		this.wallpaperPath =
			userinf?.pictures?.wallpaper || this.defaultWallpaper;
	}

	render() {
		const windowWidth = this.renderer.windowWidth;
		const windowHeight = this.renderer.windowHeight;

		const iconDefaultSize = 24;
		const iconHorizontalScaling = windowWidth / iconDefaultSize;
		const iconVerticlaScaling = windowHeight / iconDefaultSize;

		const iconScale = Math.max(iconHorizontalScaling, iconVerticlaScaling);
		const iconSize = iconDefaultSize * iconScale;

		const left = (this.renderer.windowWidth - iconSize) / 2;
		const top = (this.renderer.windowHeight - iconSize) / 2;

		this.renderer.icon(left, top, this.wallpaperPath, iconScale);
	}
}
