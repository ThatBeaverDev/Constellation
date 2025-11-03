import { filetypeDatabase } from "../../apps/services/filetypeDatabaseManager/bin/app.js";
import { ApplicationAuthorisationAPI } from "../security/env.js";

async function typeOfPath(env: ApplicationAuthorisationAPI, directory: string) {
	const stats = await env.fs.stat(directory);

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
	directory: string
): Promise<boolean | never> {
	const filetype = await typeOfPath(env, directory);
	if (filetype == undefined) return false;

	const dbContents = await env.fs.readFile("/System/ftypedb.json");

	const db = JSON.parse(dbContents) as filetypeDatabase;

	const app = db.assignments[filetype];

	if (app == undefined) {
		// deal with it
		env.debug(
			`libgui: Cannot open file at ${directory} because no application is capable.`
		);
		return false;
	} else {
		env.exec(app[0], [directory]);
		return true;
	}
}
