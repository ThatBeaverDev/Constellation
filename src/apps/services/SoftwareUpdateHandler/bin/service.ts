export default class SoftwareUpdateInstaller extends GuiApplication {
	async init() {
		// hide
		this.renderer.moveWindow(-1000, -1000);
		this.renderer.resizeWindow(0, 0);

		this.renderer.hideWindowHeader();

		// update the system
		const update = () => {
			const kernel = this.env.getKernel();

			kernel.triggerUpdate();
		};

		try {
			update();
		} catch (e: unknown) {
			if (((e as Error).name = "PermissionsError")) {
				const adminPassword = await this.renderer.askUserQuestion(
					"Please enter admin password to update Constellation:",
					"The administrator password is required to update the system.",
					"rotate-ccw"
				);

				await this.env.users.switch("admin", adminPassword);

				update();
			} else {
				throw e;
			}
		}
	}
}
