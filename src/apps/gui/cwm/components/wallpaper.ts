import ConstellationWindowManager from "../tcpsys/app.js";

export default class ConstellationWindowManagerWallpaper {
	env: ConstellationWindowManager["env"];
	renderer: ConstellationWindowManager["renderer"];
	constructor(public parent: ConstellationWindowManager) {
		this.env = parent.env;
		this.renderer = parent.renderer;
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

		this.renderer.icon(
			left,
			top,
			"/System/CoreAssets/Wallpapers/Jaguar.png",
			iconScale
		);
	}
}
