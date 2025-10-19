import ConstellationKernel from "../../../../system/kernel.js";
import { Application } from "../../../../system/runtime/components/executables.js";
import { ProcessInformation } from "../../../../system/runtime/runtime.js";
import ConstellationWindowManagerWallpaper from "../components/wallpaper.js";

export default class ConstellationWindowManager
	extends Process
	implements Application
{
	renderer: Application["renderer"];
	wallpaper?: ConstellationWindowManagerWallpaper;

	constructor(
		ConstellationKernel: ConstellationKernel,
		directory: string,
		args: any[],
		user: string,
		password: string,
		processInfo: ProcessInformation
	) {
		super(
			ConstellationKernel,
			directory,
			args,
			user,
			password,
			processInfo
		);

		const kernel = this.env.getKernel();
		const gui = kernel.ui;

		if (gui.type !== "GraphicalInterface") {
			throw new Error("GuiManager requires a GUI to manage.");
		}

		const windowSystem = gui.windowSystem;
		const window = new windowSystem.windowTypes.UnderlayWindow(
			kernel,
			"guimgr",
			this
		);

		window.move(0, 0);
		window.resize(globalThis.innerWidth + 10, globalThis.innerHeight + 10);
		window.hideHeader();
		window.hide();

		this.renderer = gui.uiKit.newRenderer(this, window);
	}

	async init() {
		this.wallpaper = new ConstellationWindowManagerWallpaper(this);
	}

	frame() {
		this.renderer.resizeWindow(window.innerWidth, window.innerHeight);

		this.renderer.clear();

		if (this.wallpaper) this.wallpaper.render();

		this.renderer.commit();
	}
}
