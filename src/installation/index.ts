import { rm_rf } from "./rm-rf.js";
import { createFolders } from "./folders.js";
import { writeFiles } from "./files.js";

import { reapplyStyles } from "../windows/windows.js";
import { setStatus } from "../constellation.config.js";

export async function install() {
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
}
