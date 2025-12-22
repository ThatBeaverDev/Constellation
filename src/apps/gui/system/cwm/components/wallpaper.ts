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

		this.renderer.image(
			0,
			0,
			this.wallpaperPath,
			windowWidth,
			windowHeight
		);
	}
}
