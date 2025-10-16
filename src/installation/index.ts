import { DevToolsColor, performanceLog } from "../lib/debug.js";
import { preinstall } from "./fs.js";
import postinstall from "./postinstall.js";
import ConstellationKernel from "../kernel.js";
import { developmentOptions } from "./installation.config.js";

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

	installationTimestamp("Initialise System", initialisationStart, "primary");

	ConstellationKernel.setBootStatus("Complete");

	installationTimestamp("Install System", start, "primary");

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

export function installationTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "SystemInstallation", colour);
}
