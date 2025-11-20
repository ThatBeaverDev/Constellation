import { installationTimestamp } from "./installationTimestamp.js";
import { FilesystemInstaller } from "./fsinstall.js";
import ConstellationKernel from "../kernel.js";

export async function preinstall(
	ConstellationKernel: ConstellationKernel,
	isSoftwareUpdate: boolean
) {
	const start = performance.now();
	ConstellationKernel.setBootStatus(`Initialising Preinstall`);

	try {
		const installer = new FilesystemInstaller(ConstellationKernel);

		await installer.install(isSoftwareUpdate);

		if (ConstellationKernel.ui.type == "GraphicalInterface")
			ConstellationKernel.ui.windowSystem.reapplyStyles();
	} catch (e: any) {
		ConstellationKernel.setBootStatus(e, "error");
		throw e; // escalate again to make sure main knows something went wrong
	}

	ConstellationKernel.setBootStatus("Preinstall Complete");

	installationTimestamp({
		label: "Erase, Download, and Write System",
		start,
		colour: "primary"
	});
}
