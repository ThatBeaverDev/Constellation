import fs from "../fs.js";

async function rmdir(dir) {
	const ls = await fs.readdir(dir);

	for (const name of ls) {
		const relative = fs.relative(dir, name);

		const stats = await fs.stat(relative);

		const isFolder = stats.isDirectory();

		if (isFolder) {
			console.log("\x1b[31m[INSTALLION / RM-RF]: Deleting Directory at " + relative + "\x1b[0m");
			await rmdir(relative);
		} else {
			console.log("\x1b[31m[INSTALLION / RM-RF]: Deleting " + relative + "\x1b[0m");
			await fs.unlink(relative);
		}
	}
}

export async function rm_rf() {
	await rmdir("/");
}
