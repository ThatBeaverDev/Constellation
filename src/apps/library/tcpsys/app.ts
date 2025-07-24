type fileInfo = {
	directory: string;
	name: string;
	icon: string;
};

export default class library extends Application {
	index: { files: fileInfo[]; names: string[] } = { files: [], names: [] };
	ui: "apps" | "manage" = "apps";

	async init() {
		await this.env.shell.index();
		await this.refresh();
	}

	async refresh() {
		const result = await this.env.shell.exec("appfind");
		this.index = result?.result;
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
			if (name.length > 10) {
				nameShortened = name.substring(0, 8) + "..";
			}

			const iconCenterX = x + iconSize / 2;
			const iconBottomY = y - iconSize / 2;

			const textWidth = this.renderer.getTextWidth(nameShortened, 13);

			this.renderer.text(
				iconCenterX - textWidth / 2,
				iconBottomY,
				nameShortened,
				13
			);

			x += iconSize + padding + padding;
			if (
				x + iconSize + padding >
				this.renderer.window.dimensions.width
			) {
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
