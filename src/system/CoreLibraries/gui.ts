import { filetypeDatabase } from "../../apps/services/filetypeDatabaseManager/bin/service.js";
import { ApplicationAuthorisationAPI } from "../security/components/env/env.js";
import { archiveSafeStat } from "/System/CoreLibraries/archives.js";
import EnvFs from "/System/security/components/env/components/fs.js";

export async function typeOfPath(fs: EnvFs, directory: string) {
	const stats = await archiveSafeStat(fs, directory);

	if (stats.isDirectory()) {
		return "folder";
	} else {
		const extension = directory.textAfterAll(".");

		if (extension == "") return undefined;
		return "." + extension;
	}
}

export async function openFile(
	env: ApplicationAuthorisationAPI,
	path: string,
	options?: {
		program?: string;
		allowPicker?: boolean;
		forcePicker?: boolean;
	}
): Promise<boolean> {
	const type = await typeOfPath(env.fs, path);
	if (!type) return false;

	const db: filetypeDatabase = JSON.parse(
		await env.fs.readFile("/System/ftypedb.json")
	);

	let app: string | undefined = options?.program ?? db.defaults[type];

	async function picker() {
		const exec = await env.exec(
			"/System/CoreLibraries/gui/selectApp.appl",
			[path]
		);

		return await exec.promise;
	}

	if (options?.forcePicker == true) {
		app = await picker();
	} else {
		if (db.handlers[type]?.length == 1) {
			// if there's only one we might as well
			app = db.handlers[type][0];
		}

		// ask the user what they want
		if (!app && (options?.allowPicker ?? true) == true) {
			env.debug(`No default app for ${type}, querying user.`);
			app = await picker();
		}
	}

	// last resort
	if (typeof app !== "string") return false;

	env.exec(app, [path]);
	return true;
}
