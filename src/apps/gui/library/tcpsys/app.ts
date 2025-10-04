import { appFindResult, fileInfo } from "../../keystone/lib/appfind.js";

export default class library extends Application {
	index: { files: fileInfo[]; names: string[] } = { files: [], names: [] };
	ui: "apps" | "manage" = "apps";

	async init() {
		await this.env.shell.index();
		await this.refresh();

		this.renderer.setIcon("square-library");
		this.renderer.windowName = "Library";
		this.renderer.maximiseWindow();
	}

	async refresh() {
		const result = await this.env.shell.exec("appfind");
		const data: appFindResult = result?.result;
		if (data == undefined)
			throw new Error("Undefined result from appfind.");

		data.files = data.files.filter((item: fileInfo) => item.visible);

		this.index = data;
	}

	async installFromURL() {}

	async install() {}

	renderApps() {
		const iconScale = 1.5;
		const iconSize = 24 * iconScale;
		const padding = 30;

		const manageApps = this.renderer.text(3, 3, "Manage Apps..");
		this.renderer.onClick(manageApps, () => {});

		let x = 0;
		let y = 15;

		x += padding;
		y += padding;
		for (const app of this.index.files) {
			if (app.directory == this.directory) continue; // don't show the library
			if (app.directory.endsWith(".backgr")) continue; // don't show background apps

			const icon = this.renderer.icon(x, y, app.icon, 1.5);

			this.renderer.onClick(icon, () => {
				this.env.exec(app.directory);
				this.exit();
				return;
			});

			const name = app.name || app.directory;

			let nameShortened = name;
			if (name.length > 15) {
				nameShortened = name.substring(0, 13) + "..";
			}

			const iconCenterX = x + iconSize / 2;
			const iconTopY = y - iconSize / 2;

			const textWidth = this.renderer.getTextWidth(nameShortened, 10);

			this.renderer.text(
				iconCenterX - textWidth / 2,
				iconTopY,
				nameShortened,
				10
			);

			x += iconSize + padding + padding;
			if (x + iconSize + padding > this.renderer.windowWidth) {
				x = 0 + padding;
				y += iconSize + padding + padding;
			}
		}
	}

	frame() {
		this.renderer.clear();

		switch (this.ui) {
			case "apps":
				this.renderApps();
				break;
			case "manage":
				break;
		}

		this.renderer.commit();
	}
}
