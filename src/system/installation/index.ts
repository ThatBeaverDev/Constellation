import { preinstall } from "./fs.js";
import postinstall from "./postinstall.js";
import ConstellationKernel from "..//kernel.js";
import { developmentOptions } from "./installation.config.js";
import { installationTimestamp } from "./installationTimestamp.js";

/**
 * Runs the non-graphical installer
 * @param ConstellationKernel - The kernel to install within.
 * @returns Whether the graphical postinstaller is required
 */
export async function install(ConstellationKernel: ConstellationKernel) {
	const start = performance.now();
	ConstellationKernel.setBootStatus(`Initialising`);

	try {
		await preinstall(ConstellationKernel);
	} catch (e: any) {
		ConstellationKernel.setBootStatus(e, "error");
		throw e; // escalate again to make sure main knows something went wrong
	}

	const initialisationStart = performance.now();

	await ConstellationKernel.security.users.newUser("guest", "", {
		fullName: "Guest",
		allowGraphicalLogin: "true"
	});
	await ConstellationKernel.security.users.newUser("admin", "administrator", {
		profilePicture: "shield-user",
		fullName: "Admin",
		allowGraphicalLogin: "true"
	});
	await ConstellationKernel.security.users.newUser(
		"system",
		ConstellationKernel.config.systemPassword,
		{
			profilePicture: "/System/CoreAssets/Logos/Constellation-lucide.svg",
			directory: "/System/user",
			operator: "true"
		}
	);

	installationTimestamp({
		label: "Initialise System",
		start: initialisationStart,
		colour: "primary"
	});

	ConstellationKernel.setBootStatus("Complete");

	installationTimestamp({
		label: "Install System",
		start,
		colour: "primary"
	});

	if (
		ConstellationKernel.config.dynamic.isDevmode &&
		!ConstellationKernel.config.dynamic.isTestingInstaller
	) {
		await postinstall(ConstellationKernel, developmentOptions);
		return false;
	} else {
		return true;
	}
}
