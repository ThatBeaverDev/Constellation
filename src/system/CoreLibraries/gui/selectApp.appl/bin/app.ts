import { type shellResult } from "/System/lib/shell";
import { type fileAppChoicesResult } from "../../../../../apps/services/filetypeDatabaseManager/lib/fileAppChoices";
import { PanelKitGuiApplication } from "/System/CoreLibraries/panelkit.js";
import { pathIcon, pathName } from "/System/CoreLibraries/pathinf";

export default class ApplicationSelector extends PanelKitGuiApplication {
	targetFile: string = "";
	apps: {
		data: { icon: string; name: string; directory: string }[];
		isBroad: boolean;
	} = {
		data: [],
		isBroad: false
	};

	async init(args: string[]) {
		this.renderer.windowName = "Open With";
		this.panelkit.sidebarWidth = 0;

		this.renderer.resizeWindow(400, 500);

		const targetFile = args[0];
		if (!targetFile) throw new Error("A file must be provided!");

		this.targetFile = targetFile;

		await this.env.shell.index();
		const shellResult: shellResult<fileAppChoicesResult> | undefined =
			await this.env.shell.exec("fileAppChoices", this.targetFile);

		if (!shellResult) {
			this.exit();
			return;
		}

		this.apps = {
			isBroad: shellResult.result.isBroad,
			data: await Promise.all(
				shellResult.result.apps.map(async (path) => {
					return {
						name: await pathName(this.env.fs, path),
						directory: path,
						icon: await pathIcon(this.env.fs, path)
					};
				})
			)
		};
	}

	async frame() {
		this.renderer.clear();
		this.panelkit.reset();

		this.panelkit.mediumCard(
			"Select an Application to open this file.",
			this.apps.isBroad
				? `No apps on your system specifically claim the filetype '${this.targetFile.textAfterAll(".")}'`
				: `These apps claim the filetype '${this.targetFile.textAfterAll(".")}'`
		);

		for (const app of this.apps.data) {
			this.panelkit.card(app.name, app.icon, async () => {
				const filetype = "." + this.targetFile.textAfterAll(".");

				// try to change default
				await this.env.shell.exec(
					"requestDefault",
					filetype,
					app.directory
				);

				this.exit(app.directory);
			});
		}

		this.renderer.commit();
	}
}
