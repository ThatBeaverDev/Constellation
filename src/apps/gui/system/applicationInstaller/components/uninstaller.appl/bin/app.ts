import PanelKit from "panelkit";
import { applicationName } from "../config.js";

export default class ApplicationUninstaller extends GuiApplication {
	panelkit = new PanelKit(this.renderer);
	async init() {
		this.renderer.windowName = `${applicationName} Uninstaller`;
		this.renderer.setIcon("package-minus");
	}

	async uninstall() {
		const hostPath = this.env.fs.resolve("../..");

		const rmdir = async (directory: string) => {
			const list = await this.env.fs.listDirectory(directory);

			for (const item of list) {
				const path = this.env.fs.resolve(directory, item);

				const stats = await this.env.fs.stat(path);

				if (stats.isDirectory()) {
					await rmdir(path);
				} else {
					await this.env.fs.deleteFile(path);
				}
			}

			await this.env.fs.deleteDirectory(directory);
		};

		await rmdir(hostPath);
		this.exit();
	}

	async frame() {
		this.renderer.clear();
		this.panelkit.sidebarWidth = 0;
		this.panelkit.reset();

		this.panelkit.card(
			`Are you sure you want to uninstall ${applicationName}?`,
			"circle-question-mark",
			undefined,
			undefined,
			{
				type: "button",
				text: "Uninstall",
				onClick: () => {
					this.uninstall();
				}
			}
		);

		this.renderer.commit();
	}
}
