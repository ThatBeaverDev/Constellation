import { rm_rf } from "./rm-rf.js";
import { createFolders } from "./folders.js";
import { writeFiles } from "./files.js";

import { reapplyStyles } from "../windows/windows.js";
import { setStatus } from "../constellation.config.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";

export async function install() {
	const start = performance.now();
	setStatus(`Installation : Initialising`);

	try {
		await rm_rf();
		await createFolders();
		await writeFiles();

		reapplyStyles();
	} catch (e: any) {
		setStatus(e, "error");
		throw e; // escalate again to make sure main knows something went wrong
	}

	setStatus("Installation : Complete");

	installationTimestamp("Install System", start, "primary");
}

export function installationTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "SystemInstallation", colour);
}
