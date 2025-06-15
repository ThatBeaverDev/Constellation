import fs from "../fs.js";

import { folders } from "./installation.config.js";

export async function createFolders() {
	for (const directory of folders) {
		await fs.mkdir(directory);
	}
}
