import PanelKit from "panelkit";
import { ProcessAlias } from "../../../../../system/security/definitions";

type Table = (string | { type: "icon"; icon: string })[][];

export default class ProcessManager extends GuiApplication {
	panelkit = new PanelKit(this.renderer);
	processes: ProcessAlias[] = [];
	data: Table = [];
	processedData: { guiApps: Table; services: Table } = {
		guiApps: [],
		services: []
	};
	counter = 0;

	async init() {
		this.renderer.windowName = "Process Manager";
		this.renderer.setIcon(this.env.fs.resolve("./resources/icon.svg"));
	}

	async refresh() {
		try {
			this.processes = this.env.processes.all();

			this.data = await Promise.all(
				this.processes.map(async (item) => {
					return [
						{ type: "icon", icon: (await item.icon) ?? "" },
						item.name,
						item.type[0].toLocaleUpperCase() +
							item.type.substring(1).toLocaleLowerCase(),
						item.username
					];
				})
			);

			// add header
			const header = ["", "Name", "Type", "User"];
			this.data.splice(0, 0, header);

			// processed data
			const services = this.data.filter((item) => {
				return item[2] == "Service";
			});
			services.splice(0, 0, header);
			const applications = this.data.filter((item) => {
				return item[2] == "Application";
			});
			applications.splice(0, 0, header);

			this.processedData = {
				guiApps: applications,
				services
			};
		} catch (e: unknown) {
			if (e instanceof Error && e.name == "PermissionsError") {
				await this.env.requestUserPermission("processes");
			}
		}
	}

	async frame() {
		if (this.counter % 1000 == 0) {
			await this.refresh();
		}
		if (!this.processes) return;

		this.renderer.clear();
		this.panelkit.reset();
		this.panelkit.sidebarWidth = 0;

		this.panelkit.table(
			`Applications (${this.processedData.guiApps.length - 1})`,
			this.processedData.guiApps
		);
		this.panelkit.table(
			`Processes (${this.processedData.services.length - 1})`,
			this.processedData.services
		);

		this.renderer.commit();
	}
}
