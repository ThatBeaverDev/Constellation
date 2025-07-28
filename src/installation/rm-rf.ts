import fs from "../io/fs.js";
import * as log from "../lib/logging.js";
import { setStatus } from "../constellation.config.js";
import { installationTimestamp } from "./index.js";
async function rmdir(dir: string) {
	const start = performance.now();

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
			const start = performance.now();

			log.warn(
				"core:installation/rmrf",
				"Deleting File at:      " + relative
			);
			await fs.unlink(relative);

			installationTimestamp(
				`Delete file ${relative}`,
				start,
				"secondary-dark"
			);
		}
	}

	await fs.rmdir(dir);

	installationTimestamp(`Delete directory ${dir}`, start, "secondary-light");
}

export async function rm_rf() {
	const start = performance.now();

	setStatus(`Installation : Deleting Files...`);
	await rmdir("/");

	installationTimestamp("Wipe Filesystem", start, "secondary");
}
