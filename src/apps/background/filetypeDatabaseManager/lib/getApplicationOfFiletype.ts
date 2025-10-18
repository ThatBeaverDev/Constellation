import TerminalAlias from "../../../../system/lib/terminalAlias.js";
import { filetypeDatabase } from "../tcpsys/app.js";

export default async function getApplicationOfFiletype(
	parent: TerminalAlias,
	filetype: string
) {
	const read = await parent.env.fs.readFile("/System/ftypedb.json");
	if (!read.ok) throw read.data;

	const db: filetypeDatabase = JSON.parse(read.data);

	return db.assignments[filetype];
}
