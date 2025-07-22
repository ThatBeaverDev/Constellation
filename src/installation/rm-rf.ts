import fs from "../io/fs.js";
import * as log from "../lib/logging.js";
import { setStatus } from "../constellation.config.js";
async function rmdir(dir: string) {
	const ls = await fs.readdir(dir);

	if (ls == undefined) {
		return;
	}

	for (const name of ls) {
		const relative = fs.resolve(dir, name);

		const stats = await fs.stat(relative);

		const isFolder = stats.isDirectory();

		if (isFolder) {
			log.warn(
				"core:installation/rmrf",
				"Deleting Directory at: " + relative
			);
			await rmdir(relative);
		} else {
			log.warn(
				"core:installation/rmrf",
				"Deleting File at:      " + relative
			);
			await fs.unlink(relative);
		}
	}

	await fs.rmdir(dir);
}

export async function rm_rf() {
	setStatus(`Installation : Deleting Files...`);
	await rmdir("/");
}
