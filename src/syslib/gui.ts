import { filetypeDatabase } from "../apps/background/filetypeDatabaseManager/tcpsys/app.js";
import { ApplicationAuthorisationAPI } from "../security/env.js";

async function typeOfPath(env: ApplicationAuthorisationAPI, directory: string) {
	const stat = await env.fs.stat(directory);

	if (!stat.ok) throw stat.data;
	const data = stat.data;

	if (data.isDirectory()) {
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

	const read = await env.fs.readFile("/System/ftypedb.json");
	if (!read.ok) throw read.data;
	const db = JSON.parse(read.data) as filetypeDatabase;

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
