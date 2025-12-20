import { pathIcon, pathName } from "/System/CoreLibraries/pathinf";

export default class ChangeDefaultsRequester extends GuiApplication {
	async init([requestee, type, oldApp, newApp]: [any, any, any, any]) {
		// make ourselves invisible
		this.renderer.resizeWindow(0, 0);
		this.renderer.moveWindow(-1000, -1000);

		if (typeof requestee !== "string")
			throw new Error(
				"Args must be [requestee, type, oldApp, newApp] as strings"
			);
		if (typeof type !== "string")
			throw new Error(
				"Args must be [requestee, type, oldApp, newApp] as strings"
			);
		if (typeof oldApp !== "string")
			throw new Error(
				"Args must be [requestee, type, oldApp, newApp] as strings"
			);
		if (typeof newApp !== "string")
			throw new Error(
				"Args must be [requestee, type, oldApp, newApp] as strings"
			);

		const requesteeIcon = await pathIcon(this.env.fs, requestee);
		const requesteeName = await pathName(this.env.fs, requestee);

		const newAppName = await pathName(this.env.fs, newApp);
		const oldAppName = await pathName(this.env.fs, oldApp);

		const result = await this.renderer.showUserPrompt(
			`Change default app for ${type} files.`,
			`'${requesteeName}' wants ${newAppName} to open ${type} files rather than ${oldAppName}.`,
			"Change",
			"Leave it",
			requesteeIcon
		);

		this.exit(result == "primary");
	}
}
