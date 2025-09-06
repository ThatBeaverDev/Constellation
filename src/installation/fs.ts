import { installationTimestamp } from "./index.js";
import { FilesystemInstaller } from "./fsinstall.js";
import ConstellationKernel from "../kernel.js";

export async function preinstall(ConstellationKernel: ConstellationKernel) {
	const start = performance.now();
	ConstellationKernel.config.setStatus(
		`Installation: Initialising Preinstall`
	);

	try {
		const installer = new FilesystemInstaller(ConstellationKernel);

		await installer.rm_rf();
		await installer.folders();
		await installer.files();

		if (ConstellationKernel.GraphicalInterface)
			ConstellationKernel.GraphicalInterface.windows.reapplyStyles();
	} catch (e: any) {
		ConstellationKernel.config.setStatus(e, "error");
		throw e; // escalate again to make sure main knows something went wrong
	}

	ConstellationKernel.config.setStatus("Installation: Preinstall Complete");

	installationTimestamp(
		"Erase, Download, and Write System",
		start,
		"primary"
	);
}
