import { rm_rf } from "./rm-rf.js";
import { createFolders } from "./folders.js";
import { writeFiles } from "./files.js";

import { reapplyStyles } from "../windows/windows.js";

export async function install() {
	await rm_rf();
	await createFolders();
	await writeFiles();

	reapplyStyles();
}
