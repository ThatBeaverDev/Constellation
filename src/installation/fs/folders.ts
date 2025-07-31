import { setStatus } from "../../constellation.config.js";
import fs from "../../io/fs.js";
import { installationTimestamp } from "../index.js";

import { folders } from "../installation.config.js";

export async function createFolders() {
	const start = performance.now();
	setStatus(`Installation: Creating Folders...`);

	for (const directory of folders) {
		const start = performance.now();
		await fs.mkdir(directory);
		installationTimestamp(`Create ${directory}`, start);
	}

	installationTimestamp("Create Directories", start, "secondary");
}
