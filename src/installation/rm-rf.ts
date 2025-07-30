import fs from "../io/fs.js";
import { setStatus } from "../constellation.config.js";
import { installationTimestamp } from "./index.js";

export async function rm_rf() {
	const start = performance.now();

	const files: string[] = [];
	const directories: string[] = [];

	async function walk(dir: string) {
		const start = performance.now();

		const ls = await fs.readdir(dir);

		if (ls == undefined) {
			return;
		}

		for (const name of ls) {
			const resolved = fs.resolve(dir, name);

			const stats = await fs.stat(resolved);

			const isFolder = await stats.isDirectory();

			if (isFolder) {
				directories.push(resolved);

				await walk(resolved);
			} else {
				files.push(resolved);
			}
		}

		installationTimestamp(
			`Walk directory ${dir}`,
			start,
			"secondary-light"
		);
	}

	setStatus(`Installation : Deleting Files...`);
	await walk("/");

	const startDeleteFiles = performance.now();
	const promises: Promise<any>[] = [];
	for (const i in files) {
		promises.push(fs.unlink(files[i]));
	}

	for (const i in promises) {
		await promises[i];
	}
	installationTimestamp("Delete files", startDeleteFiles, "secondary");

	const startDeleteDirectories = performance.now();
	for (const i in directories) {
		await fs.rmdir(directories[i]);
	}
	installationTimestamp("Delete Directories", startDeleteDirectories);

	installationTimestamp("Wipe Filesystem", start, "secondary");
}
