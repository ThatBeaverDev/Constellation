import { setStatus } from "../constellation.config.js";
import fs from "../io/fs.js";
import { installationTimestamp } from "./index.js";

import { folders } from "./installation.config.js";

export async function createFolders() {
	const start = performance.now();
	setStatus(`Installation : Creating Folders...`);

	for (const directory of folders) {
		await fs.mkdir(directory);
	}

	installationTimestamp("Create Directories", start, "secondary");
}
