import { setStatus } from "../constellation.config.js";
import fs from "../io/fs.js";

import { folders } from "./installation.config.js";

export async function createFolders() {
	setStatus(`Installation : Creating Folders...`);

	for (const directory of folders) {
		await fs.mkdir(directory);
	}
}
