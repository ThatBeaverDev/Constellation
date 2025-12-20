import { filetypeDatabase } from "../bin/service";
import { typeOfPath } from "/System/CoreLibraries/gui";
import TerminalAlias from "/System/lib/terminalAlias";

export interface fileAppChoicesResult {
	isBroad: boolean;
	apps: string[];
}

export default async function getAppsForFile(
	parent: TerminalAlias,
	path: string
) {
	const type = await typeOfPath(parent.env.fs, path);
	if (!type) return [];

	const db = JSON.parse(
		await parent.env.fs.readFile("/System/ftypedb.json")
	) as filetypeDatabase;

	const result: fileAppChoicesResult = {
		isBroad: false,
		apps: []
	};

	if (db.handlers[type]) {
		result.apps = db.handlers[type];
	} else {
		result.apps = db.apps
			.filter((app) => app.filetypes.length !== 0)
			.map((app) => app.directory);
		result.isBroad = true;
	}

	return result;
}
