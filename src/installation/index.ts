import {
	isDevmode,
	setStatus,
	systemPassword
} from "../constellation.config.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import { preinstall } from "./fs.js";
import devinstall from "./devinstall.js";
import ConstellationKernel from "../main.js";

export async function install(ConstellationKernel: ConstellationKernel) {
	const start = performance.now();
	setStatus(`Installation: Initialising`);

	try {
		await preinstall();
	} catch (e: any) {
		setStatus(e, "error");
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
	await ConstellationKernel.security.users.newUser("system", systemPassword, {
		profilePicture: "/System/CoreAssets/Logos/Constellation-lucide.svg",
		directory: "/System/user",
		operator: "true"
	});

	if (isDevmode) {
		await devinstall(ConstellationKernel);
	} else {
		// TODO: download n execute the installer
	}

	// mark this boot as postinstall, allows launchd / CoreExecutable to start the graphical part of installation.
	const params = new URL(window.location.href).searchParams;
	params.set("postinstall", "true");
	window.history.pushState({}, "", "?" + params.toString());

	installationTimestamp("Initialise System", initialisationStart, "primary");

	setStatus("Installation: Complete");

	installationTimestamp("Install System", start, "primary");
}

export function installationTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "SystemInstallation", colour);
}
