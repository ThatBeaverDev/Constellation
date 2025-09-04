import fs from "../../io/fs.js";
import { setStatus } from "../../constellation.config.js";
import { installationTimestamp } from "../index.js";

//export async function rm_rf() {
//	const start = performance.now();
//
//	const files: string[] = [];
//	const directories: string[] = [];
//
//	async function walk(dir: string) {
//		const start = performance.now();
//
//		const ls = await fs.readdir(dir);
//		console.log(ls);
//
//		if (ls == undefined) {
//			return;
//		}
//
//		for (const name of ls) {
//			const resolved = fs.resolve(dir, name);
//
//			const stats = await fs.stat(resolved);
//
//			const isFolder = await stats.isDirectory();
//
//			if (isFolder) {
//				directories.push(resolved);
//
//				await walk(resolved);
//			} else {
//				files.push(resolved);
//			}
//		}
//
//		installationTimestamp(
//			`Walk directory ${dir}`,
//			start,
//			"secondary-light"
//		);
//	}
//
//	setStatus(`Installation: Deleting Files...`);
//	await walk("/");
//
//	const startDeleteFiles = performance.now();
//
//	for (const i in files) {
//		await fs.unlink(files[i]);
//	}
//
//	// try again because it likes to miss some.
//	for (const i in files) {
//		await fs.unlink(files[i]);
//	}
//
//	installationTimestamp("Delete files", startDeleteFiles, "secondary");
//
//	const startDeleteDirectories = performance.now();
//	for (const i in directories) {
//		await fs.rmdir(directories[i]);
//	}
//
//	// try again because it likes to miss some.
//	for (const i in directories) {
//		await fs.rmdir(directories[i]);
//	}
//	installationTimestamp("Delete Directories", startDeleteDirectories);
//
//	installationTimestamp("Wipe Filesystem", start, "secondary");
//}

// or, you know, we COULD just delete the filesystem properly. 🤦

export async function rm_rf() {
	const databases: IDBDatabaseInfo[] = await window.indexedDB.databases();

	for (const i in databases) {
		const database = databases[i];
		if (database.name == undefined) return;

		const DBDeleteRequest = window.indexedDB.deleteDatabase(database.name);

		DBDeleteRequest.onerror = (event) => {
			console.error(`Error deleting database ${database.name}.`);
		};

		DBDeleteRequest.onsuccess = (event) => {
			console.log(`Database ${database.name} deleted successfully`);
		};
	}
}
