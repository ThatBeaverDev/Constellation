import { openFile } from "/System/CoreLibraries/gui";
import PanelKit from "/System/CoreLibraries/panelkit";
import { pathIcon } from "/System/CoreLibraries/pathinf";

export default class ConstellationDesktop extends GuiApplication {
	contents: { name: string; icon: string; path: string }[] = [];
	path: string = "/";
	panelkit = new PanelKit(this.renderer);
	counter = 0;
	iconScale = 2;
	padding = 10;

	async init(args: string[]) {
		if (typeof args?.[0] == "string") {
			this.path = args[0];
		}

		await this.refresh();

		this.renderer.windowName = "Desktop";
	}

	async refresh() {
		const contents = await this.env.fs.listDirectory(this.path);

		this.renderer.makeWindowInvisible();
		this.renderer.hideWindowCorners();
		this.renderer.hideWindowHeader();
		this.renderer.moveWindow(0, 0);
		this.renderer.resizeWindow(
			this.renderer.displayWidth,
			this.renderer.displayHeight
		);

		this.contents = await Promise.all(
			contents.map(async (name) => {
				const path = this.env.fs.resolve(this.path, name);

				return {
					name: path.textAfterAll("/"),
					icon: await pathIcon(
						this.env,
						this.env.fs.resolve(this.path, path)
					),
					path
				};
			})
		);
	}

	frame() {
		if (!this.env.windows) return;
		if (this.counter++ % 50 == 0) {
			this.refresh();
		}

		this.renderer.clear();
		this.panelkit.reset();
		this.panelkit.sidebarWidth = 0;

		let x = this.env.windows.leftBound + this.padding;
		let y = this.env.windows.upperBound + this.padding;

		for (const item of this.contents) {
			const textWidth = this.renderer.getTextWidth(item.name);
			const iconSize = 24 * this.iconScale;

			const boxWidth = textWidth + iconSize + this.padding * 3;
			const boxHeight = iconSize + this.padding * 2;

			this.renderer
				.box(x, y, boxWidth, boxHeight, {
					isFrosted: true,
					background: "rgb(from var(--bg-dark) r g b / 0.5)",
					borderRadius: 10
				})
				.onClick(() => {
					openFile(this.env, item.path);
				});

			this.renderer
				.icon(
					x + this.padding,
					y + this.padding,
					item.icon,
					this.iconScale
				)
				.passthrough();
			this.renderer
				.text(x + iconSize + this.padding * 2, y + 24, item.name)
				.passthrough();

			y += boxHeight + this.padding;
		}

		this.renderer.commit();
	}
}
