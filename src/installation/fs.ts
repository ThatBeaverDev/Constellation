import { installationTimestamp } from "./index.js";
import { setStatus } from "../constellation.config.js";
import { reapplyStyles } from "../windows/windows.js";
import { writeFiles } from "./fs/files.js";
import { createFolders } from "./fs/folders.js";
import { rm_rf } from "./fs/rm-rf.js";

export async function preinstall() {
	const start = performance.now();
	setStatus(`Installation: Initialising Preinstall`);

	try {
		await rm_rf();
		await createFolders();
		await writeFiles();

		reapplyStyles();
	} catch (e: any) {
		setStatus(e, "error");
		throw e; // escalate again to make sure main knows something went wrong
	}

	setStatus("Installation: Preinstall Complete");

	installationTimestamp("Download and Write System", start, "primary");
}
