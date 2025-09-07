import { DevToolsColor, performanceLog } from "../lib/debug.js";
import { preinstall } from "./fs.js";
import devinstall from "./devinstall.js";
import ConstellationKernel from "../kernel.js";

export async function install(ConstellationKernel: ConstellationKernel) {
	const start = performance.now();
	ConstellationKernel.config.setStatus(`Installation: Initialising`);

	try {
		await preinstall(ConstellationKernel);
	} catch (e: any) {
		ConstellationKernel.config.setStatus(e, "error");
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

	if (ConstellationKernel.config.isDevmode) {
		await devinstall(ConstellationKernel);
	} else {
		// TODO: download n execute the installer
	}

	// mark this boot as postinstall, allows CoreExecutable to start the graphical part of installation.
	if (window.location && window.history) {
		const params = new URL(window.location.href).searchParams;
		params.set("postinstall", "true");

		window.history.pushState({}, "", "?" + params.toString());
	}

	installationTimestamp("Initialise System", initialisationStart, "primary");

	ConstellationKernel.config.setStatus("Installation: Complete");

	installationTimestamp("Install System", start, "primary");
}

export function installationTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "SystemInstallation", colour);
}
