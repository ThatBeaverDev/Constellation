import TerminalAlias from "../../../../system/lib/terminalAlias.js";
import { filetypeDatabase } from "../bin/service.js";

export default async function getApplicationOfFiletype(
	parent: TerminalAlias,
	filetype: string
) {
	const databaseContents = await parent.env.fs.readFile(
		"/System/ftypedb.json"
	);

	const db: filetypeDatabase = JSON.parse(databaseContents);

	return db.assignments[filetype];
}
