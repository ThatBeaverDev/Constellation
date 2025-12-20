import ConstellationKernel from "../../../../../system/kernel.js";
import { GuiApplication } from "../../../../../system/runtime/components/executables.js";
import { IPCMessage } from "../../../../../system/runtime/components/messages.js";
import { ProcessInformation } from "../../../../../system/runtime/runtime.js";
import { ConstellationWindowManagerWallpaper } from "../components/wallpaper.js";

export default class ConstellationWindowManager
	extends Process
	implements GuiApplication
{
	renderer: GuiApplication["renderer"];
	wallpaper!: ConstellationWindowManagerWallpaper;

	constructor(
		ConstellationKernel: ConstellationKernel,
		directory: string,
		args: unknown[],
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
		window.square();

		this.renderer = gui.uiKit.newRenderer(this, window);
		this.renderer.windowBackgroundStyles = "";
	}

	async init() {
		this.shout("ConstellationWindowManager");

		this.wallpaper = new ConstellationWindowManagerWallpaper(this);
		await this.wallpaper.init();
	}

	frame() {
		this.renderer.resizeWindow(window.innerWidth, window.innerHeight);
		this.renderer.moveWindow(0, 0);

		this.renderer.clear();

		this.wallpaper.render();

		this.renderer.commit();
	}

	async onmessage(msg: IPCMessage): Promise<void> {
		if (!msg.originDirectory.startsWith("/System/CoreExecutables")) return;

		switch (msg.intent) {
			case "changeWallpaper":
				const wallpaperPath: any =
					msg.data ?? this.wallpaper.defaultWallpaper;

				if (!(typeof wallpaperPath == "string")) {
					this.env.warn(
						"Wallpaper could not be changed because requested path",
						wallpaperPath,
						"is not a string."
					);
					return;
				}

				const contents = await this.env.fs.readFile(wallpaperPath);

				if (contents == undefined) {
					this.env.warn(
						`File at ${JSON.stringify(wallpaperPath)} does not exist!`
					);
					return;
				}

				this.wallpaper.wallpaperPath = wallpaperPath;

				break;
			default:
				this.env.warn(
					`Message with invalid intent '${msg.intent}' recieved.`
				);
		}
	}
}
